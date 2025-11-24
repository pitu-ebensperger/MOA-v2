import process from 'process'
import { readdir, stat } from 'fs/promises'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const distPath = join(__dirname, '..', 'dist', 'assets')

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const getColor = (size) => {
  const kb = size / 1024
  if (kb < 50) return '\x1b[32m' // verde
  if (kb < 150) return '\x1b[33m' // amarillo
  return '\x1b[31m' // rojo
}

const analyzeBundle = async () => {
  try {
    const files = await readdir(distPath)
    
    const jsFiles = []
    const cssFiles = []
    let totalSize = 0

    for (const file of files) {
      const filePath = join(distPath, file)
      const stats = await stat(filePath)
      const ext = extname(file)
      
      if (ext === '.js') {
        jsFiles.push({ name: file, size: stats.size })
        totalSize += stats.size
      } else if (ext === '.css') {
        cssFiles.push({ name: file, size: stats.size })
        totalSize += stats.size
      }
    }

    // Ordenar por tamaño descendente
    jsFiles.sort((a, b) => b.size - a.size)
    cssFiles.sort((a, b) => b.size - a.size)

    console.log('Análisis de Bundle - MOA Frontend\n')
    console.log('═'.repeat(80))
    
    console.log('\n JavaScript Chunks:\n')
    jsFiles.forEach(file => {
      const color = getColor(file.size)
      const reset = '\x1b[0m'
      const sizeStr = formatBytes(file.size).padStart(10)
      console.log(`${color}${sizeStr}${reset}  ${file.name}`)
    })

    if (cssFiles.length > 0) {
      console.log('\n CSS Files:\n')
      cssFiles.forEach(file => {
        const sizeStr = formatBytes(file.size).padStart(10)
        console.log(`${sizeStr}  ${file.name}`)
      })
    }

    console.log('\n' + '═'.repeat(80))
    console.log(`\nTotal: ${formatBytes(totalSize)}`)
    console.log(` JS Files: ${jsFiles.length}`)
    console.log(` CSS Files: ${cssFiles.length}`)
    
    // Identificar el chunk inicial (index)
    const initialChunk = jsFiles.find(f => f.name.includes('index'))
    if (initialChunk) {
      console.log(`\n⚡ Initial Bundle: ${formatBytes(initialChunk.size)}`)
      
      const initialPercent = ((initialChunk.size / totalSize) * 100).toFixed(1)
      console.log(` Initial / Total: ${initialPercent}%`)
    }

    // Recomendaciones
    console.log('\n Recomendaciones:\n')
    
    const largeChunks = jsFiles.filter(f => f.size > 150 * 1024)
    if (largeChunks.length > 0) {
      console.log('Chunks grandes detectados (>150KB):')
      largeChunks.forEach(f => {
        console.log(`   • ${f.name} - ${formatBytes(f.size)}`)
      })
      console.log('Considera dividir estos chunks o mover dependencias a chunks separados.\n')
    }

    if (jsFiles.length > 20) {
      console.log('Muchos chunks generados.')
      console.log('Considera agrupar chunks relacionados para reducir HTTP requests.\n')
    }

    const totalKB = totalSize / 1024
    if (totalKB < 500) {
      console.log('Tamaño total excelente (<500KB)\n')
    } else if (totalKB < 1000) {
      console.log('Tamaño total aceptable (<1MB)\n')
    } else {
      console.log('Tamaño total alto (>1MB)')
      console.log('   Considera optimizar dependencias o implementar tree shaking.\n')
    }

    console.log('═'.repeat(80) + '\n')

  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('\nError: No se encontró la carpeta dist/assets')
      console.error('   Ejecuta primero: npm run build\n')
    } else {
      console.error('\nError analizando bundle:', error.message, '\n')
    }
    process.exit(1)
  }
}

analyzeBundle()
