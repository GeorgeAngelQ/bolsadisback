import { randomUUID } from "node:crypto"
import { Request, Response, NextFunction } from "express";


export function requestIdMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  const id = randomUUID()
  res.locals.requestId = id
  res.setHeader('X-Request-Id', id)
  next()
}
