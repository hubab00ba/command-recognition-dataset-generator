import { chunk } from 'lodash'
import settings from './settings'
import { generateRequests, generateURLs } from './lib/requests'
import { createDirectories, downloadWAVsFromURLs, saveURLs } from './lib/files'

const app = async () => {
  createDirectories()
  const requests = generateRequests()
  const chunks = chunk(requests, settings.chunkSize)
  const urls = await generateURLs(chunks)
  saveURLs(urls)
  await downloadWAVsFromURLs(urls)
}

app()
  .then(() => console.log('Done!'))
  .catch((error) => console.error(error))
