import type { VideoInfo } from './bilibili'
import { readFile, writeFile } from 'node:fs/promises'
import MarkdownIt from 'markdown-it'
import { gc, m } from '../utils'
import { generateContent } from './common'

export async function generateHTML(data: VideoInfo[]) {
  const md = new MarkdownIt({
    html: true,
  })
  const htmlTemplate = await readFile('./templates/index.template.html', { encoding: 'utf-8' })
  const content = generateContent(data, htmlTemplate)
  let result = m`${md.render(content)}`
  result = htmlTemplate.replace(
    gc('CONTENT'),
    `${result}`,
  )
  await writeFile('./index.html', result, { encoding: 'utf-8' })
}
