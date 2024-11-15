import console from 'node:console'
import { getBilibiliRankData } from './lib/bilibili'
import { generateHTML } from './lib/html'
import { generateMarkdown } from './lib/markdown'

async function main() {
  const data = await getBilibiliRankData()
  if (data.length > 0) {
    await generateMarkdown(data)
    await generateHTML(data)
  }
}

try {
  main()
}
catch (e) {
  console.error(e)
}
