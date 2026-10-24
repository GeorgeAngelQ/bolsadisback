import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { runInTransaction, closePool } from '@infrastructure/persistence/postgres/connection/PostgresConnection'

const RAIZ = path.join(process.cwd(), 'src/infrastructure/persistence/postgres/repositories')
const LECTURA = /^(find|exists|count|list|buscar|get)/i
// SQLSTATE que indican un defecto del SQL (no un dato faltante)
const DEFECTOS: Record<string, string> = {
  '42P01': 'tabla inexistente', '42703': 'columna inexistente', '42601': 'error de sintaxis',
  '42P02': 'parámetro inexistente', '42883': 'función/operador inexistente', '08P01': 'nº de parámetros no coincide',
  '42P09': 'referencia ambigua', '42803': 'GROUP BY incorrecto', '42702': 'columna ambigua', '42P10': 'columna inválida',
}
const ROLLBACK = new Error('rollback')

function archivos(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? archivos(path.join(dir, e.name)) : e.name.endsWith('.ts') ? [path.join(dir, e.name)] : [])
}

async function main() {
  const defectos: string[] = []
  const revisar: string[] = []
  let probados = 0
  for (const archivo of archivos(RAIZ)) {
    const modulo = require(archivo)
    for (const [nombre, Clase] of Object.entries<any>(modulo)) {
      if (!/^Postgres.*Repository$/.test(nombre) || typeof Clase !== 'function') continue
      const repo = new Clase()
      const metodos = Object.getOwnPropertyNames(Clase.prototype).filter(m => LECTURA.test(m) && typeof repo[m] === 'function')
      for (const m of metodos) {
        const args = repo[m].length === 1 && /^findAll$/i.test(m) ? [{}] : Array(repo[m].length).fill(1)
        probados++
        try {
          await runInTransaction(async () => { await repo[m](...args); throw ROLLBACK })
        } catch (e: any) {
          if (e === ROLLBACK) continue
          const sqlstate = e?.context?.sqlstate ?? e?.code
          if (sqlstate && DEFECTOS[sqlstate]) {
            const detalle = String(e?.cause?.message ?? e.message).split('\n')[0].slice(0, 110)
            defectos.push(`✗ ${nombre}.${m}  [${DEFECTOS[sqlstate]}] ${detalle}`)
          } else if (e instanceof TypeError || e instanceof ReferenceError) {
            revisar.push(`? ${nombre}.${m}  ${e.message.slice(0, 100)}`)
          }
        }
      }
    }
  }
  console.log(`Métodos de lectura ejecutados: ${probados}`)
  if (defectos.length === 0) console.log('✓ Sin defectos de SQL detectados')
  else { console.log(`Defectos de SQL: ${defectos.length}`); defectos.forEach(d => console.log('  ' + d)) }
  if (revisar.length) { console.log(`\nPara revisar a mano (probablemente por el argumento de prueba): ${revisar.length}`); revisar.forEach(d => console.log('  ' + d)) }
  await closePool()
  process.exit(defectos.length > 0 ? 1 : 0)
}
main()