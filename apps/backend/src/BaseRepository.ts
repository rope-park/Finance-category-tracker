import pool from '../config/database';

export interface DatabaseConnection {
  query(text: string, params?: any[]): Promise<any>;
  getClient?(): Promise<any>;
  release?(): void;
}

export abstract class BaseRepository {
  protected db: DatabaseConnection;

  constructor(database: DatabaseConnection = pool) {
    this.db = database;
  }

  /**
   * 트랜잭션을 실행합니다
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
   * 페이지네이션을 위한 공통 쿼리 빌더
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
   * SQL 쿼리에서 다음 파라미터 인덱스를 계산합니다
   */
  private getNextParamIndex(query: string): number {
    const matches = query.match(/\$\d+/g);
    return matches ? matches.length + 1 : 1;
  }

  /**
   * WHERE 절을 동적으로 구성합니다
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
   * UPDATE SET 절을 동적으로 구성합니다
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
   * 단일 레코드를 조회합니다
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
   * 여러 레코드를 조회합니다
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
   * 레코드 개수를 조회합니다
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
   * 레코드를 생성합니다
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
   * 레코드를 업데이트합니다
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
   * 레코드를 삭제합니다
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
   * Upsert (INSERT ON CONFLICT UPDATE)를 수행합니다
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
   * 원시 SQL 쿼리를 실행합니다
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
