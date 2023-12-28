import fs from 'fs'
import type G from 'glob'
import glob from 'glob'
import { watch } from 'gulp'
import { mkdirp } from 'mkdirp'
import path from 'path'
import sharp from 'sharp'

import 'dotenv/config'

const ORIGIN_IMAGES = process.env.ORIGIN_IMAGES!
const COMPRESSED_IMAGES = process.env.COMPRESSED_IMAGES!

async function compress() {
  const globOptions: G.IOptions = { nodir: true }

  const originFiles = deleteUnusualFormats(
    glob.sync(`${ORIGIN_IMAGES}/**`, globOptions),
  )
  const compressedFiles = glob.sync(`${ORIGIN_IMAGES}/**`, globOptions)

  const newOrChangedFiles = originFiles.filter((file) => {
    const { dir: fileDir, name: fileName } = path.parse(file)

    return !compressedFiles.some((compressedFile) => {
      const { dir: comressedFileDir, name: comressedFileName } =
        path.parse(compressedFile)

      return (
        `${replaceDir(fileDir)}/${fileName}` ===
        `${comressedFileDir}/${comressedFileName}`
      )
    })
  })

  newOrChangedFiles.forEach((file) => {
    const { dir, name } = path.parse(file)

    const newDirPath = replaceDir(dir)

    mkdirp.sync(newDirPath)

    sharp(file)
      .withMetadata()
      .webp()
      .toFile(`${newDirPath}/${name}.webp`)
      .catch((err) => {
        console.log(err)
      })
  })
}

function replaceDir(path: string) {
  return path.replace(ORIGIN_IMAGES, COMPRESSED_IMAGES)
}

function deleteUnusualFormats(files: string[]) {
  return files.filter((file) => {
    if (file.includes(':Zone.Identifier')) {
      fs.unlink(file, console.log)
    } else {
      return true
    }
  })
}

export { compress }

export default function () {
  watch(`${ORIGIN_IMAGES}/**`, { ignoreInitial: false }, compress)
}
