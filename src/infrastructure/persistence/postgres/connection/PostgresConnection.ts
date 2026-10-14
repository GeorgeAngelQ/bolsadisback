import { Pool, PoolClient, QueryResult, QueryResultRow} from 'pg';
import { AsyncLocalStorage } from 'node:async_hooks'
import { translatePgError } from '../errors/PostgresErrorTranslator';

const pool = new Pool({
   host: process.env.DB_HOST,
   port: parseInt(process.env.DB_PORT!),
   user: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_NAME,
   max: parseInt(process.env.DB_POOL_MAX!),
   idleTimeoutMillis: 30000,
   connectionTimeoutMillis: 5000,
   options: `-c search_path=${process.env.DB_SCHEMA}`
})

pool.on('error', err => console.error('[PG] Error en cliente inactivo del pool:', err))

const transactionContext = new AsyncLocalStorage<PoolClient>();

export async function runQuery<T extends QueryResultRow>(
   sql: string,
   params: any[]
): Promise<QueryResult<T>> {
   try {
      const client = transactionContext.getStore()
      return client ? await client.query<T>(sql, params) : await pool.query<T>(sql, params)
   } catch (error) {
      throw translatePgError
   }
}

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

export async function runInTransaction<T>(work: ()=> Promise<T>): Promise<T> {
   if (transactionContext.getStore()) return work()
   
   const client = await pool.connect().catch(error => { throw translatePgError(error) })
   
   let releaseError: Error | undefined
   try {
      await client.query('BEGIN')
      
      const result = await transactionContext.run(client, work)

      await client.query('COMMIT')

      return result
   }
   catch (error) {
      try {
         await client.query('ROLLBACK')
      } catch (rollbackError) {
         console.error('Falló el ROLLBACK: ', rollbackError)
         releaseError = rollbackError as Error
      }
      throw translatePgError(error)
   }
   finally {
      client.release(releaseError)
   }
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