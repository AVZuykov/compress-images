import fs from 'fs/promises'
import glob from 'glob'
import { dest, lastRun, series, src, watch } from 'gulp'
import path from 'path'
import sharp from 'sharp'
import { optimize } from 'svgo'
import through2 from 'through2'
import File from 'vinyl'

import 'dotenv/config'

const ORIGIN_IMAGES = process.env.ORIGIN_IMAGES!
const COMPRESSED_IMAGES = process.env.COMPRESSED_IMAGES!

const AVAILABLE_FORMATS = ['.png', '.jpeg', '.jpg', '.webp', '.gif', '.svg']

function compressTask() {
  return src(`${ORIGIN_IMAGES}/**`, { since: lastRun(compressTask) })
    .pipe(filterAndRemovePlugin(AVAILABLE_FORMATS))
    .pipe(compressPlugin())
    .pipe(dest('dist'))
}

function compressPlugin() {
  return through2.obj(async function (file: File, enc: string, callback) {
    try {
      if (file.isBuffer()) {
        switch (file.extname) {
          case '.svg': {
            const { data: optimizedSvgString } = optimize(file.contents.toString('utf-8'))
            file.contents = Buffer.from(optimizedSvgString)
            break
          }

          default: {
            file.contents = await sharp(file.contents).withMetadata().webp().toBuffer()
            file.extname = '.webp'
          }
        }
      }

      this.push(file)
      callback()
    } catch (error) {
      const err = error as Error
      callback(new Error(`Ошибка при обработке файла ${file.path}: ${err.message}`))
    }
  })
}

function filterAndRemovePlugin(ignoreExt: string[] = []) {
  return through2.obj(async function (file: File, enc: string, callback) {
    try {
      if (file.isBuffer()) {
        if (ignoreExt.some((format) => file.extname.endsWith(format))) {
          this.push(file)
        } else {
          await fs.rm(file.path)
        }
      }
      callback()
    } catch (error) {
      const err = error as Error
      callback(new Error(`Ошибка при удалении файла ${file.path}: ${err.message}`))
    }
  })
}

async function syncFilesTask() {
  const originFiles = globFiles(ORIGIN_IMAGES)
  const compressedFiles = globFiles(COMPRESSED_IMAGES)

  const trashFiles = compressedFiles.filter((compressedFilePath) =>
    originFiles.every((originFilePath) => !compressedFilePath.endsWith(originFilePath))
  )

  for (const path of trashFiles) {
    await fs.rm(COMPRESSED_IMAGES + path, { recursive: true, force: true })
  }

  function globFiles(baseDir: string) {
    return glob
      .sync(`${baseDir}/**`)
      .map((globPath) => {
        const parsedPath = path.parse(globPath)
        const pathWithoutExtension = path.join(parsedPath.dir, parsedPath.name)
        return pathWithoutExtension.replace(baseDir, '')
      })
      .filter(Boolean)
  }
}

async function delDistTask() {
  await fs.rm(COMPRESSED_IMAGES, { recursive: true, force: true })
}

function startWatch() {
  watch(`${ORIGIN_IMAGES}/**`, { ignoreInitial: false }, series(compressTask, syncFilesTask))
}

export { compressTask, syncFilesTask, delDistTask }

export default series(delDistTask, startWatch)
