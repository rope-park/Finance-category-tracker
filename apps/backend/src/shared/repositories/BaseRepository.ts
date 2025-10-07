/**
 * 기본 리포지토리 클래스
 * 
 * 모든 리포지토리 클래스의 공통 기능을 제공하는 추상 기본 클래스.
 * 데이터베이스 연결, 트랜잭션 처리, 페이지네이션, 동적 쿼리 생성 등의 공통 기능 제공.
 * 
 * 주요 기능:
 * - 데이터베이스 연결 및 쿼리 실행 추상화
 * - 트랜잭션 관리 및 롤백 지원
 * - 페이지네이션 쿼리 빌더
 * - 동적 WHERE 절 및 UPDATE SET 절 생성
 * - SQL 인젝션 방지 및 보안 처리
 * - 오류 처리 및 로깅 표준화
 * 
 * @author Ju Eul Park (rope-park)
 */
import pool from '../../core/config/database';

// 데이터베이스 연결 인터페이스
export interface DatabaseConnection {
  query(text: string, params?: any[]): Promise<any>;  // 쿼리 실행 메서드
  getClient?(): Promise<any>;                         // 커넥션 풀에서 클라이언트 획득 메서드
  release?(): void;                                   // 커넥션 반환 메서드
}

/**
 * 기본 리포지토리 추상 클래스
 * 
 * 공통 데이터베이스 작업을 위한 메서드를 제공하며,
 * 구체적인 리포지토리 클래스는 이 클래스를 상속받아 구현함.
 */
export abstract class BaseRepository {
  protected db: DatabaseConnection;

  // 생성자 - 데이터베이스 연결 주입
  constructor(database: DatabaseConnection = pool) {
    this.db = database;
  }

  /**
   * 트랜잭션 실행 메서드
   * @param callback - 트랜잭션 내에서 실행할 비동기 콜백 함수
   * @returns 콜백 함수의 결과
   */
  protected async executeTransaction<T>(
    callback: (client: any) => Promise<T>
  ): Promise<T> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 페이지네이션 쿼리 빌더
   * @param baseQuery - 기본 데이터 조회 쿼리
   * @param totalCountQuery - 전체 데이터 개수 조회 쿼리
   * @param limit - 한 페이지에 표시할 데이터 개수
   * @param offset - 데이터 조회 시작 위치
   * @param orderBy - 정렬 기준
   * @returns 페이지네이션 쿼리 객체
   */
  protected buildPaginationQuery(
    baseQuery: string,
    totalCountQuery: string,
    limit: number,
    offset: number,
    orderBy: string = 'created_at DESC'
  ): {
    dataQuery: string;
    countQuery: string;
    limit: number;
    offset: number;
  } {
    return {
      dataQuery: `${baseQuery} ORDER BY ${orderBy} LIMIT $${this.getNextParamIndex(baseQuery)} OFFSET $${this.getNextParamIndex(baseQuery) + 1}`,
      countQuery: totalCountQuery,
      limit,
      offset
    };
  }

  /**
   * SQL 쿼리에서 다음 파라미터 인덱스 계산
   * @param query - 쿼리 문자열
   * @returns 다음 파라미터 인덱스
   */
  private getNextParamIndex(query: string): number {
    const matches = query.match(/\$\d+/g);
    return matches ? matches.length + 1 : 1;
  }

  /**
   * WHERE 절 동적 구성
   * @param conditions - WHERE 절에 사용할 조건 객체
   * @returns WHERE 절과 값 배열
   */
  protected buildWhereClause(conditions: Record<string, any>): {
    whereClause: string;
    values: any[];
    paramIndex: number;
  } {
    const whereConditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [field, value] of Object.entries(conditions)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // IN 조건
          const placeholders = value.map(() => `$${paramIndex++}`).join(', ');
          whereConditions.push(`${field} IN (${placeholders})`);
          values.push(...value);
        } else if (typeof value === 'object' && value.operator) {
          // 커스텀 연산자 (>=, <=, LIKE 등)
          whereConditions.push(`${field} ${value.operator} $${paramIndex++}`);
          values.push(value.value);
        } else {
          // 일반 등식
          whereConditions.push(`${field} = $${paramIndex++}`);
          values.push(value);
        }
      }
    }

    return {
      whereClause: whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '',
      values,
      paramIndex
    };
  }

  /**
   * UPDATE SET 절 동적 구성
   * @param data - 업데이트할 필드와 값 객체
   * @param startParamIndex - 시작 파라미터 인덱스
   * @returns SET 절과 값 배열
   */
  protected buildSetClause(data: Record<string, any>, startParamIndex: number = 1): {
    setClause: string;
    values: any[];
    paramIndex: number;
  } {
    const setConditions: string[] = [];
    const values: any[] = [];
    let paramIndex = startParamIndex;

    for (const [field, value] of Object.entries(data)) {
      if (value !== undefined) {
        setConditions.push(`${field} = $${paramIndex++}`);
        values.push(value);
      }
    }

    return {
      setClause: setConditions.join(', '),
      values,
      paramIndex
    };
  }

  /**
   * 단일 레코드 조회
   * @param tableName - 테이블 이름
   * @param conditions - 조회 조건
   * @param columns - 선택할 열
   * @returns 단일 레코드 또는 null
   */
  protected async findOne<T>(
    tableName: string,
    conditions: Record<string, any>,
    columns: string = '*'
  ): Promise<T | null> {
    const { whereClause, values } = this.buildWhereClause(conditions);
    const query = `SELECT ${columns} FROM ${tableName} ${whereClause} LIMIT 1`;
    
    const result = await this.db.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * 여러 레코드 조회
   * @param tableName - 테이블 이름
   * @param conditions - 조회 조건
   * @param columns - 선택할 열
   * @param orderBy - 정렬 기준
   * @param limit - 최대 조회 개수
   * @param offset - 조회 시작 위치
   * @returns 레코드 배열
   */
  protected async findMany<T>(
    tableName: string,
    conditions: Record<string, any> = {},
    columns: string = '*',
    orderBy: string = 'created_at DESC',
    limit?: number,
    offset?: number
  ): Promise<T[]> {
    const { whereClause, values } = this.buildWhereClause(conditions);
    let query = `SELECT ${columns} FROM ${tableName} ${whereClause} ORDER BY ${orderBy}`;
    
    if (limit) {
      query += ` LIMIT $${values.length + 1}`;
      values.push(limit);
      
      if (offset) {
        query += ` OFFSET $${values.length + 1}`;
        values.push(offset);
      }
    }
    
    const result = await this.db.query(query, values);
    return result.rows;
  }

  /**
   * 레코드 개수 조회
   * @param tableName - 테이블 이름
   * @param conditions - 조회 조건
   * @returns - 레코드 개수 
   */
  protected async count(
    tableName: string,
    conditions: Record<string, any> = {}
  ): Promise<number> {
    const { whereClause, values } = this.buildWhereClause(conditions);
    const query = `SELECT COUNT(*) as count FROM ${tableName} ${whereClause}`;
    
    const result = await this.db.query(query, values);
    return parseInt(result.rows[0].count);
  }

  /**
   * 레코드 생성
   * @param tableName - 테이블 이름
   * @param data - 생성할 레코드 데이터
   * @param returningColumns - 반환할 열
   * @returns - 생성된 레코드
   */
  protected async create<T>(
    tableName: string,
    data: Record<string, any>,
    returningColumns: string = '*'
  ): Promise<T> {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    const query = `
      INSERT INTO ${tableName} (${fields.join(', ')})
      VALUES (${placeholders})
      RETURNING ${returningColumns}
    `;
    
    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  /**
   * 레코드 업데이트
   * @param tableName - 테이블 이름
   * @param data - 업데이트할 데이터
   * @param conditions - 업데이트할 조건
   * @param returningColumns - 반환할 열
   * @returns - 업데이트된 레코드
   */
  protected async update<T>(
    tableName: string,
    data: Record<string, any>,
    conditions: Record<string, any>,
    returningColumns: string = '*'
  ): Promise<T | null> {
    const { setClause, values } = this.buildSetClause(data);
    const { whereClause, values: whereValues, paramIndex } = this.buildWhereClause(conditions);
    
    // 파라미터 인덱스를 조정
    const adjustedWhereClause = whereClause.replace(/\$(\d+)/g, (match, num) => {
      return `$${parseInt(num) + values.length}`;
    });
    
    const query = `
      UPDATE ${tableName}
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      ${adjustedWhereClause}
      RETURNING ${returningColumns}
    `;
    
    const result = await this.db.query(query, [...values, ...whereValues]);
    return result.rows[0] || null;
  }

  /**
   * 레코드 삭제
   * @param tableName - 테이블 이름
   * @param conditions - 삭제할 조건
   * @returns - 삭제 성공 여부
   */
  protected async delete(
    tableName: string,
    conditions: Record<string, any>
  ): Promise<boolean> {
    const { whereClause, values } = this.buildWhereClause(conditions);
    const query = `DELETE FROM ${tableName} ${whereClause}`;
    
    const result = await this.db.query(query, values);
    return result.rowCount > 0;
  }

  /**
   * 레코드 생성 또는 업데이트 (Upsert)
   * @param tableName - 테이블 이름
   * @param data - 생성할 데이터
   * @param conflictColumns - 충돌 검사할 열
   * @param updateData - 업데이트할 데이터
   * @param returningColumns - 반환할 열
   * @returns - 생성 또는 업데이트된 레코드
   */
  protected async upsert<T>(
    tableName: string,
    data: Record<string, any>,
    conflictColumns: string[],
    updateData?: Record<string, any>,
    returningColumns: string = '*'
  ): Promise<T> {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    let query = `
      INSERT INTO ${tableName} (${fields.join(', ')})
      VALUES (${placeholders})
      ON CONFLICT (${conflictColumns.join(', ')})
    `;
    
    if (updateData && Object.keys(updateData).length > 0) {
      const { setClause } = this.buildSetClause(updateData, values.length + 1);
      query += ` DO UPDATE SET ${setClause}, updated_at = CURRENT_TIMESTAMP`;
      values.push(...Object.values(updateData));
    } else {
      query += ' DO NOTHING';
    }
    
    query += ` RETURNING ${returningColumns}`;
    
    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  /**
   * 원시 SQL 쿼리 실행
   * @param query - 실행할 원시 SQL 쿼리
   * @param params - 쿼리 파라미터
   * @returns - 쿼리 결과
   */
  protected async executeRawQuery<T>(
    query: string,
    params: any[] = []
  ): Promise<{ rows: T[]; rowCount: number }> {
    const result = await this.db.query(query, params);
    return {
      rows: result.rows,
      rowCount: result.rowCount || 0
    };
  }
}