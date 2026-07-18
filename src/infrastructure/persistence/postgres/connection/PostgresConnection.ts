import { Pool, QueryResultRow} from 'pg';

const pool = new Pool({
   host: process.env.DB_HOST,
   port: parseInt(process.env.DB_PORT!),
   user: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_NAME,
   max: parseInt(process.env.DB_POOL_MAX!),
   idleTimeoutMillis: 30000,
   connectionTimeoutMillis: 5000,
})

export async function query <T extends QueryResultRow>(
   sql: string,
   params: any[] = [],
): Promise<T[]> {
   const result = await pool.query<T>(sql, params)
   return result.rows
}

export async function queryOne<T extends QueryResultRow>(
   sql: string,
   params: any[] = [],
): Promise<T | null> {
   const result = await pool.query<T>(sql, params)
   return result.rows[0] ?? null
}

export async function execute(
   sql:string,
   params:any[] = [],
): Promise<void>{
   await pool.query(sql, params)
}

export async function closePool(): Promise<void> {
   await pool.end()
}

export default pool