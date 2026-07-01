import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { dirname, extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)))
const port = Number(process.env.PORT || 4177)

const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

function fileFor(urlPath) {
  const cleanPath = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^(\.\.[/\\])+/, '')
  const target = resolve(root, cleanPath === '/' ? 'index.html' : cleanPath.slice(1))
  if (!target.startsWith(root)) return null
  if (existsSync(target) && statSync(target).isDirectory()) return join(target, 'index.html')
  return target
}

const server = createServer((req, res) => {
  const file = fileFor(req.url || '/')
  if (!file || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('Not found')
    return
  }

  res.writeHead(200, {
    'content-type': types[extname(file)] || 'application/octet-stream',
    'cache-control': 'no-store',
  })
  createReadStream(file).pipe(res)
})

server.listen(port, '127.0.0.1', () => {
  console.log(`Neon Gauntlet running at http://127.0.0.1:${port}/`)
})
