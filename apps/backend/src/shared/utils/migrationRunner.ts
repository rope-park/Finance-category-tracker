/**
 * 데이터베이스 마이그레이션 실행 유틸리티
 * 
 * PostgreSQL 데이터베이스에 대한 SQL 마이그레이션 파일을 자동 실행 도구.
 * 데이터베이스 스키마 변경, 테이블 생성, 인덱스 추가 등의 작업을 안전하게 수행.
 * 
 * 주요 기능:
 * - SQL 마이그레이션 파일 개별 실행
 * - 다중 SQL 문 자동 분리 및 순차 실행
 * - 마이그레이션 실행 로그 및 오류 처리
 * - 배치 마이그레이션 처리 지원
 * 
 * @author Ju Eul Park (rope-park)
 */
import pool from '../../core/config/database';
import fs from 'fs';
import path from 'path';

/**
 * 마이그레이션 실행기 클래스
 * 
 * 지정된 SQL 마이그레이션 파일을 읽고 데이터베이스에 적용하는 기능 제공.
 */
export class MigrationRunner {
  /**
   * 단일 마이그레이션 파일 실행 메서드
   * @param migrationFile - 실행할 마이그레이션 SQL 파일명 (예: '001_initial_schema.sql')
   * @throws {Error} 마이그레이션 실행 중 오류 발생 시 예외 발생
   */
  static async runMigration(migrationFile: string): Promise<void> {
    try {
      const migrationPath = path.join(__dirname, '..', 'database', 'migrations', migrationFile);
      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      // SQL을 세미콜론으로 분리하여 각각 실행
      const statements = sql
        .split(';')
        .map(statement => statement.trim())
        .filter(statement => statement.length > 0);
      
      for (const statement of statements) {
        if (statement.trim()) {
          await pool.query(statement);
          console.log(`✅ Executed: ${statement.substring(0, 50)}...`);
        }
      }
      
      console.log(`🎉 Migration ${migrationFile} completed successfully!`);
    } catch (error) {
      console.error(`❌ Migration ${migrationFile} failed:`, error);
      throw error;
    }
  }

  /**
   * 모든 마이그레이션 파일 일괄 실행 메서드 
   * @throws {Error} 마이그레이션 실행 중 오류 발생 시 예외 발생
   */
  static async runAllMigrations(): Promise<void> {
    const migrationFiles = [
      '005_create_social_tables.sql'
    ];

    for (const file of migrationFiles) {
      await this.runMigration(file);
    }
  }
}

// 직접 실행할 수 있도록 설정 (노드 모듈로 직접 실행될 때만 동작)
if (require.main === module) {
  MigrationRunner.runAllMigrations()
    .then(() => {
      console.log('🎉 All migrations completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}