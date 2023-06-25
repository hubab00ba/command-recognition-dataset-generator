import axios from 'axios'
import { mapSeries } from 'async'
import { isEmpty, isNil } from 'lodash'

import settings from '../settings'
import voiceEffects from './config/voice-effects'
import voices from './config/voices'

import type { RequestData } from './types/general'

export const generateRequests = (): RequestData[] => {
  type Product = string | { Engine: string; VoiceId: string; Language: string }
  const cartesianProduct = (arr: Product[][]) =>
    arr.reduce(
      (a: Product[][], b: Product[]) =>
        a
          .map((x) => b.map((y) => x.concat([y])))
          .reduce((a: Product[][], b: Product[][]) => a.concat(b), []),
      [[]]
    )

  const isValidForEffect = (effect: string, voiceId: string, language: string) =>
    voiceEffects
      .find((e) => e.effects.includes(effect))
      ?.filter?.find((e) => e.language === language || e.language === 'all')
      ?.voiceIds.includes(voiceId)

  const { commands, speeds, volumes, pitches, effects } = settings

  const combinations = cartesianProduct([commands, voices, speeds, volumes, pitches]) as [
    string,
    { Engine: string; VoiceId: string; Language: string },
    string,
    string,
    string
  ][]

  return combinations
    .map(([command, { VoiceId: voiceId, Language: languageCode }, speed, volume, pitch]) => {
      const request = {
        VoiceId: voiceId,
        LanguageCode: languageCode,
        Text: command,
        Effect: 'default',
        MasterSpeed: speed,
        MasterVolume: volume,
        MasterPitch: pitch,
      }

      const withEffects = effects
        .filter((effect) => isValidForEffect(effect, voiceId, languageCode))
        .map((effect) => ({ ...request, Effect: effect }))

      return [request, ...withEffects]
    })
    .flat()
}

export const sendRequestsForChunk = async (
  chunk: RequestData[],
  depth = 0
): Promise<{ url: string; params: RequestData }[]> => {
  const sendRequest = (params: RequestData) =>
    axios
      .post<{ path: string }>(
        '/',
        {
          Engine: 'neural',
          OutputFormat: 'wav',
          SampleRate: settings.sampleRate,
          ...params,
        },
        {
          baseURL: settings.voicemakerUrl,
          headers: { Authorization: `Bearer ${process.env.VOICEMAKER_API_KEY}` },
        }
      )
      .then(({ data: { path: url } }) => {
        if (isNil(url)) {
          return { url: null, params }
        }

        return { url, params }
      })
      .catch(() => ({ url: null, params }))

  const result = await Promise.allSettled(chunk.map(sendRequest))

  const resolved = result.filter(({ status }) => status === 'fulfilled') as unknown as {
    url: string
    params: RequestData
  }[]

  const rejected = result.filter(({ status }) => status === 'rejected') as unknown as {
    url: null
    params: RequestData
  }[]

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const output = resolved.map(({ url, params }) => ({ url, params }))
  const MAX_DEPTH = 3
  if (!isEmpty(rejected) && depth < MAX_DEPTH) {
    // Voicemaker API blocks for too many requests
    console.log('Waiting 10 seconds...')
    await wait(10000)

    const retry = await sendRequestsForChunk(
      rejected.map(({ params }) => params),
      depth + 1
    )

    output.push(...retry)
  }

  return output
}

export const generateURLs = async (chunks: RequestData[][]) => {
  let index = 0

  return await mapSeries(chunks, async (chunk: RequestData[]) => {
    const requestsResults = await sendRequestsForChunk(chunk)

    index += requestsResults.length
    console.log(`Generated ${index}/${chunks.length * settings.chunkSize}`)

    return requestsResults
  }).then((result) => result.flat())
}
