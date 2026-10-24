import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const routesDir = path.join(root, 'src/infrastructure/routes')

// Prefijo con el que index.routes.ts monta cada archivo
const PREFIJOS: Record<string, string> = {
  'auth.routes.ts': '/auth',
  'administracion.routes.ts': '/administracion',
}

const normalizar = (p: string) => p.replace(/:([A-Za-z0-9_]+)/g, '{$1}').replace(/\/+$/, '') || '/'

// Rutas reales (lectura estática de los archivos *.routes.ts)
const reales = new Map<string, string>() 
for (const file of fs.readdirSync(routesDir)) {
  if (!file.endsWith('.routes.ts') || file === 'index.routes.ts') continue
  const sinComentarios = fs
    .readFileSync(path.join(routesDir, file), 'utf8')
    .split('\n')
    .filter(l => !l.trim().startsWith('//'))
    .join('\n')
  const re = /router\.(get|post|put|patch|delete)\(\s*['"`]([^'"`]+)['"`]/g
  for (const m of sinComentarios.matchAll(re)) {
    reales.set(`${m[1].toUpperCase()} ${normalizar((PREFIJOS[file] ?? '') + m[2])}`, file)
  }
}

// Rutas documentadas
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { openApiSpec } = require(path.join(root, 'src/docs/openapi'))
const documentadas = new Set<string>()
for (const [p, ops] of Object.entries<any>(openApiSpec.paths ?? {})) {
  for (const metodo of Object.keys(ops)) {
    if (['get', 'post', 'put', 'patch', 'delete'].includes(metodo)) {
      documentadas.add(`${metodo.toUpperCase()} ${normalizar(p)}`)
    }
  }
}

//  Comparación 
const sinDocumentar = [...reales.keys()].filter(k => !documentadas.has(k)).sort()
const huerfanas = [...documentadas].filter(k => !reales.has(k)).sort()

console.log(`Rutas reales: ${reales.size} | documentadas: ${documentadas.size} | cobertura: ${Math.round(((reales.size - sinDocumentar.length) / reales.size) * 100)}%`)
if (huerfanas.length) {
  console.log(`\n✗ Documentadas pero NO existen (método o path equivocado): ${huerfanas.length}`)
  huerfanas.forEach(k => console.log('   ' + k))
}
if (sinDocumentar.length) {
  console.log(`\n○ Rutas sin documentar: ${sinDocumentar.length}`)
  const porArchivo: Record<string, string[]> = {}
  sinDocumentar.forEach(k => (porArchivo[reales.get(k)!] ??= []).push(k))
  for (const [f, ks] of Object.entries(porArchivo)) {
    console.log(`  ${f} (${ks.length})`)
    ks.forEach(k => console.log('     ' + k))
  }
}
const strict = process.argv.includes('--strict')
process.exit(huerfanas.length > 0 || (strict && sinDocumentar.length > 0) ? 1 : 0)