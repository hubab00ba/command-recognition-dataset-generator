import axios from 'axios'
import { mapSeries } from 'async'
import { v4 as uuid } from 'uuid'
import { capitalize } from 'lodash'
import { ensureDirSync } from 'fs-extra'
import { createWriteStream, writeFileSync } from 'fs'

import settings from '../settings'

import type { RequestData } from './types/general'

export const createDirectories = (): void => {
  const outputFolderPath = `${settings.rootDirPath}/${settings.outputDirName}`
  ensureDirSync(outputFolderPath)

  settings.commands.forEach((command) => {
    const commandFolderPath = `${outputFolderPath}/${command}`
    ensureDirSync(commandFolderPath)
  })
}

export const saveURLs = (urls: { url: string; params: RequestData }[]) => {
  const content = urls
    .map((file) => {
      const {
        Text: command,
        MasterSpeed: speed,
        MasterVolume: volume,
        MasterPitch: pitch,
        Effect: effect,
      } = file.params

      const key = `${command}_s${speed}_v${volume}_p${pitch}_e${capitalize(effect)}`

      return `${key}, ${file.url}`
    })
    .join('\n')

  writeFileSync(`${settings.rootDirPath}/${settings.outputDirName}/urls.txt`, content)
}

export const downloadWAVsFromURLs = async (
  files: { url: string; params: RequestData }[]
): Promise<number> => {
  let index = 0

  await mapSeries(files, async ({ url, params }: { url: string; params: RequestData }) => {
    const {
      Text: command,
      MasterSpeed: speed,
      MasterVolume: volume,
      MasterPitch: pitch,
      Effect: effect,
    } = params

    const filename = `${command}_s${speed}_v${volume}_p${pitch}_e${capitalize(
      effect
    )}_${uuid().slice(0, 8)}.wav`

    const file = createWriteStream(
      `${settings.rootDirPath}/${settings.outputDirName}/${command}/${filename}`
    )

    return axios.get(url, { responseType: 'stream' }).then(
      ({ data }) =>
        new Promise((resolve) => {
          data
            .pipe(file)
            .on('finish', () => {
              console.log(`Downloaded ${++index}/${files.length} files`)

              file.close()
              resolve(true)
            })
            .on('error', () => resolve(false))
        })
    )
  })

  return index
}
