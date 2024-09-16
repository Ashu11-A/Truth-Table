import { Stats } from 'fs'
import { readdir } from 'fs/promises'
import { stat } from 'fs/promises'
import { join } from 'path'

const isDir = (state: Stats) => state.isDirectory()
const isFile = (state: Stats) => state.isFile()

export async function glob (path: string) {
  const files: string[] = []

  const recursive = async (path: string) => {
    const arquives = await readdir(path)

    for (const arquive of arquives) {
      const subDir = join(path, arquive)
      const state = await stat(subDir)
    
      if (isDir(state)) await recursive(subDir)
      if (isFile(state)) files.push(subDir)
    }
  }

  await recursive(path)
  return files
}