export interface IUnitWork {
  execute<T>(work: () => Promise<T>): Promise<T> 
}