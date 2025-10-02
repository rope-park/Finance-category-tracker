import pool from '../../core/config/database';
import fs from 'fs';
import path from 'path';

export class MigrationRunner {
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

  static async runAllMigrations(): Promise<void> {
    const migrationFiles = [
      '005_create_social_tables.sql'
    ];

    for (const file of migrationFiles) {
      await this.runMigration(file);
    }
  }
}

// 직접 실행할 수 있도록
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
