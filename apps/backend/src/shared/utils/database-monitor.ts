/**
 * 데이터베이스 성능 모니터링 유틸리티
 *
 * PostgreSQL 데이터베이스의 쿼리 성능, 연결 상태, 슬로우 쿼리 등을 실시간 모니터링.
 * 데이터베이스 병목 현상을 사전에 감지하고 성능 최적화 지점 식별.
 * 
 * 주요 기능:
 * - SQL 쿼리 실행 시간 및 빈도 모니터링
 * - 슬로우 쿼리 감지 및 경고 시스템 (임계값 설정)
 * - 데이터베이스 연결 풀 모니터링
 * - 쿼리 패턴 분석 및 성능 추적
 * - 인덱스 사용률 및 효율성 모니터링
 * 
 * @author Ju Eul Park (rope-park)
 */
import { QueryRunner } from 'typeorm';
import logger, { loggerHelpers } from './logger';
import { metricsHelpers } from './metrics';

// 쿼리 성능 데이터 인터페이스
interface QueryPerformanceData {
  query: string;          // 실행된 SQL 쿼리
  parameters?: any[];     // 쿼리 매개변수
  executionTime: number;  // 쿼리 실행 시간 (밀리초)
  rowsAffected?: number;  // 영향받은 행 수
  error?: Error;          // 실행 중 발생한 에러 (있을 경우)
}

// 느린 쿼리 임계값 설정 (밀리초 단위)
interface SlowQueryThresholds {
  select: number;
  insert: number;
  update: number;
  delete: number;
  default: number;
}

/**
 * 데이터베이스 성능 모니터링 클래스
 * 
 * TypeORM의 QueryRunner를 래핑하여 쿼리 실행 시점에 성능 데이터를 수집.
 * 느린 쿼리 감지, 통계 집계, 로그 기록, 메트릭 보고 기능 포함.
 */
export class DatabasePerformanceMonitor {
  private static slowQueryThresholds: SlowQueryThresholds = {
    select: 1000, // 1초
    insert: 500,  // 0.5초
    update: 500,  // 0.5초
    delete: 500,  // 0.5초
    default: 1000 // 1초
  };

  private static queryStats = new Map<string, {
    count: number;
    totalTime: number;
    avgTime: number;
    maxTime: number;
    minTime: number;
    errors: number;
  }>();

  // 쿼리 실행 래퍼
  static async monitorQuery<T>(
    queryRunner: QueryRunner | any,
    originalMethod: string,
    query: string,
    parameters?: any[]
  ): Promise<T> {
    const startTime = Date.now();
    const querySignature = this.normalizeQuery(query);
    const operation = this.getQueryOperation(query);

    try {
      let result: T;
      
      if (originalMethod === 'query') {
        result = await queryRunner.query(query, parameters);
      } else {
        result = await queryRunner[originalMethod](query, parameters);
      }

      const executionTime = Date.now() - startTime;
      const rowsAffected = Array.isArray(result) ? result.length : 
                          (result as any)?.affected || 0;

      // 성능 데이터 기록
      this.recordQueryPerformance({
        query: querySignature,
        parameters,
        executionTime,
        rowsAffected
      });

      // 메트릭 기록
      metricsHelpers.recordDatabaseQuery(operation, 'unknown', executionTime, true);

      // 느린 쿼리 감지
      this.checkSlowQuery({
        query: querySignature,
        parameters,
        executionTime,
        rowsAffected
      });

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      // 에러 기록
      this.recordQueryPerformance({
        query: querySignature,
        parameters,
        executionTime,
        error: error as Error
      });

      // 메트릭 기록
      metricsHelpers.recordDatabaseQuery(operation, 'unknown', executionTime, false);

      // 로그 기록
      loggerHelpers.logDatabaseQuery(querySignature, executionTime, error as Error);

      throw error;
    }
  }

  // 쿼리 정규화 (매개변수 제거하여 패턴 인식)
  private static normalizeQuery(query: string): string {
    return query
      .replace(/\$\d+/g, '?')           // PostgreSQL 매개변수
      .replace(/\?/g, '?')              // MySQL 매개변수
      .replace(/\s+/g, ' ')             // 공백 정규화
      .trim()
      .toLowerCase();
  }

  // 쿼리 작업 타입 추출
  private static getQueryOperation(query: string): string {
    const normalizedQuery = query.trim().toLowerCase();
    
    if (normalizedQuery.startsWith('select')) return 'select';
    if (normalizedQuery.startsWith('insert')) return 'insert';
    if (normalizedQuery.startsWith('update')) return 'update';
    if (normalizedQuery.startsWith('delete')) return 'delete';
    if (normalizedQuery.startsWith('create')) return 'create';
    if (normalizedQuery.startsWith('drop')) return 'drop';
    if (normalizedQuery.startsWith('alter')) return 'alter';
    
    return 'unknown';
  }

  // 쿼리 성능 데이터 기록
  private static recordQueryPerformance(data: QueryPerformanceData): void {
    const { query, executionTime, error } = data;
    
    if (!this.queryStats.has(query)) {
      this.queryStats.set(query, {
        count: 0,
        totalTime: 0,
        avgTime: 0,
        maxTime: 0,
        minTime: Infinity,
        errors: 0
      });
    }

    const stats = this.queryStats.get(query)!;
    stats.count++;
    stats.totalTime += executionTime;
    stats.avgTime = stats.totalTime / stats.count;
    stats.maxTime = Math.max(stats.maxTime, executionTime);
    stats.minTime = Math.min(stats.minTime, executionTime);
    
    if (error) {
      stats.errors++;
    }

    // 상세 로그
    logger.debug('Database query executed', {
      query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
      executionTime: `${executionTime}ms`,
      rowsAffected: data.rowsAffected,
      error: error?.message
    });
  }

  // 느린 쿼리 체크
  private static checkSlowQuery(data: QueryPerformanceData): void {
    const { query, executionTime, parameters } = data;
    const operation = this.getQueryOperation(query);
    const threshold = this.slowQueryThresholds[operation as keyof SlowQueryThresholds] || 
                     this.slowQueryThresholds.default;

    if (executionTime > threshold) {
      logger.warn('Slow query detected', {
        query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
        executionTime: `${executionTime}ms`,
        threshold: `${threshold}ms`,
        operation,
        parameters: parameters?.slice(0, 5), // 처음 5개 매개변수만
        improvement_suggestions: this.generateOptimizationSuggestions(query, operation, executionTime)
      });
    }
  }

  // 최적화 제안 생성
  private static generateOptimizationSuggestions(query: string, operation: string, executionTime: number): string[] {
    const suggestions: string[] = [];
    const normalizedQuery = query.toLowerCase();

    // SELECT 쿼리 최적화 제안
    if (operation === 'select') {
      if (!normalizedQuery.includes('limit')) {
        suggestions.push('Consider adding LIMIT clause to reduce result set');
      }
      
      if (normalizedQuery.includes('select *')) {
        suggestions.push('Avoid SELECT * - specify only needed columns');
      }
      
      if (normalizedQuery.includes('where') && !normalizedQuery.includes('index')) {
        suggestions.push('Consider adding indexes on WHERE clause columns');
      }
      
      if (normalizedQuery.includes('order by') && !normalizedQuery.includes('index')) {
        suggestions.push('Consider adding indexes on ORDER BY columns');
      }
      
      if (normalizedQuery.includes('join') && normalizedQuery.split('join').length > 3) {
        suggestions.push('Consider reducing number of JOINs or using subqueries');
      }
    }

    // INSERT 쿼리 최적화 제안
    if (operation === 'insert') {
      if (!normalizedQuery.includes('batch') && executionTime > 100) {
        suggestions.push('Consider using batch INSERT for better performance');
      }
    }

    // UPDATE/DELETE 쿼리 최적화 제안
    if (operation === 'update' || operation === 'delete') {
      if (!normalizedQuery.includes('where')) {
        suggestions.push('Always use WHERE clause to avoid full table operations');
      }
      
      if (normalizedQuery.includes('where') && !normalizedQuery.includes('limit')) {
        suggestions.push('Consider adding LIMIT clause for large updates/deletes');
      }
    }

    // 일반적인 제안
    if (executionTime > 5000) {
      suggestions.push('Query takes very long - consider query restructuring');
      suggestions.push('Check for missing indexes or table statistics');
    }

    return suggestions;
  }

  // 쿼리 통계 조회
  static getQueryStats(): Array<{
    query: string;
    count: number;
    avgTime: number;
    maxTime: number;
    minTime: number;
    totalTime: number;
    errors: number;
    errorRate: number;
  }> {
    return Array.from(this.queryStats.entries()).map(([query, stats]) => ({
      query,
      count: stats.count,
      avgTime: Math.round(stats.avgTime * 100) / 100,
      maxTime: stats.maxTime,
      minTime: stats.minTime === Infinity ? 0 : stats.minTime,
      totalTime: stats.totalTime,
      errors: stats.errors,
      errorRate: Math.round((stats.errors / stats.count) * 100 * 100) / 100
    })).sort((a, b) => b.avgTime - a.avgTime);
  }

  // 가장 느린 쿼리들 조회
  static getSlowestQueries(limit: number = 10): Array<any> {
    return this.getQueryStats()
      .slice(0, limit)
      .filter(stat => stat.avgTime > 100); // 100ms 이상인 쿼리만
  }

  // 가장 많이 실행되는 쿼리들 조회
  static getMostFrequentQueries(limit: number = 10): Array<any> {
    return this.getQueryStats()
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  // 통계 리셋
  static resetStats(): void {
    this.queryStats.clear();
    logger.info('Database performance statistics reset');
  }

  // 임계값 설정
  static setThresholds(thresholds: Partial<SlowQueryThresholds>): void {
    this.slowQueryThresholds = { ...this.slowQueryThresholds, ...thresholds };
    logger.info('Database performance thresholds updated', { thresholds: this.slowQueryThresholds });
  }
}

/**
 * TypeORM QueryRunner 패치
 * @param queryRunner - 패치할 TypeORM QueryRunner 인스턴스
 * @returns 패치된 QueryRunner 인스턴스
 */
export const patchQueryRunner = (queryRunner: QueryRunner): QueryRunner => {
  const originalQuery = queryRunner.query.bind(queryRunner);
  
  queryRunner.query = async function(query: string, parameters?: any[]): Promise<any> {
    return DatabasePerformanceMonitor.monitorQuery(
      { query: originalQuery },
      'query',
      query,
      parameters
    );
  };

  return queryRunner;
};

export default DatabasePerformanceMonitor;
