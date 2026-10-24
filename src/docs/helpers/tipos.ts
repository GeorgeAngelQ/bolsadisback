export type ComoJson<T> = 
  T extends Date ? string 
  : T extends Array<infer U> ? Array<ComoJson<U>> 
  : T extends object ? { [K in keyof T]: ComoJson<T[K]>} 
  : T