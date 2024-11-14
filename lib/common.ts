import type { VideoInfo } from './bilibili'
import dayjs from 'dayjs'
import { TIMEZONE } from '../constants'
import { gc, htmlEncodeByRegExp, m } from '../utils'

interface ItemModel {
  index: number
  title: string
  url: string
}

function generateItemHTML(item: ItemModel) {
  return m`<li><span>${item.index} - <a href="${encodeURI(item.url)}" target="_blank">${htmlEncodeByRegExp(item.title)}</a></span></li>`
}

export function generateContent(data: VideoInfo[], template: string) {
  let newContent = template
  // 注入 CONTENT
  {
    const res = data.reduce((acc, cur, index) => {
      const item: ItemModel = {
        index: index + 1,
        title: cur.title,
        url: `https://www.bilibili.com/${cur.bvid}`,
      }
      return acc.concat(generateItemHTML(item))
    }, '')
    newContent = newContent.replace(
      gc('CONTENT'),
      m`<ul>${res}</ul>`,
    )
  }

  // 注入 FOOTER
  {
    const now = new Date()
    const next = dayjs().add(6, 'h').toDate()

    newContent = newContent.replace(
      gc('FOOTER'),
      m`
                    <p align="center">此页面<strong>间隔 6 小时</strong>自动刷新生成！
                    </br>
                    刷新于：${now.toLocaleString(undefined, {
                      timeStyle: 'short',
                      dateStyle: 'short',
                      timeZone: TIMEZONE,
                    })}
                    <br/>
                    下一次刷新：${next.toLocaleString(undefined, {
                      timeStyle: 'short',
                      dateStyle: 'short',
                      timeZone: TIMEZONE,
                    })}</p>
                `,
    )
  }
  return newContent
}
