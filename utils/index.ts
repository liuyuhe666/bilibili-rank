import { minify } from 'html-minifier'
import { COMMNETS } from '../constants'

export function htmlEncodeByRegExp(str: string) {
  let s = ''
  if (str.length === 0)
    return s
  s = str.replace(/&/g, '&amp;')
  s = s.replace(/</g, '&lt;')
  s = s.replace(/>/g, '&gt;')
  s = s.replace(/ /g, '&nbsp;')
  s = s.replace(/'/g, '&#39;')
  s = s.replace(/"/g, '&quot;')
  return s
}

export function htmlDecodeByRegExp(str: string) {
  let s = ''
  if (str.length === 0)
    return s
  s = str.replace(/&amp;/g, '&')
  s = s.replace(/&lt;/g, '<')
  s = s.replace(/&gt;/g, '>')
  s = s.replace(/&nbsp;/g, ' ')
  s = s.replace(/&#39;/g, '\'')
  s = s.replace(/&quot;/g, '"')
  return s
}

export function m(html: TemplateStringsArray, ...args: any[]) {
  const str = html.reduce((s, h, i) => s + h + (args[i] ?? ''), '')
  return minify(str, {
    removeAttributeQuotes: true,
    removeEmptyAttributes: true,
    removeTagWhitespace: true,
    collapseWhitespace: true,
  }).trim()
}

export function gc(token: keyof typeof COMMNETS) {
  return `<!-- ${COMMNETS[token]} -->`
}
