import { IUnitOfWork } from '@application/ports/IUnitOfWork';
import { runInTransaction } from '@infrastructure/persistence/postgres/connection/PostgresConnection';

export class PostgresUnitOfWork implements IUnitOfWork {
  execute<T>(work: () => Promise<T>): Promise<T> {
    return runInTransaction(work)
  }
}