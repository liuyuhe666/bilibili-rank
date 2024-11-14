import type { VideoInfo } from './bilibili'
import { readFile, rm, writeFile } from 'node:fs/promises'
import { generateContent } from './common'

export async function generateMarkdown(data: VideoInfo[]) {
  const template = await readFile('./templates/README.template.md', { encoding: 'utf-8' })
  const content = generateContent(data, template)
  await rm('./README.md', { force: true })
  await writeFile('./README.md', content, { encoding: 'utf-8' })
}
