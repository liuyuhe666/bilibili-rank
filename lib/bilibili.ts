import { ofetch } from 'ofetch'
import { API_URL } from '../constants'

export interface VideoInfo {
  aid: number
  pic: string
  title: string
  pubdate: number
  ctime: number
  desc: string
  bvid: string
}

export async function getBilibiliRankData(): Promise<VideoInfo[]> {
  const result: VideoInfo[] = []
  const { data, code, message } = await ofetch(API_URL, {
    parseResponse: JSON.parse,
    headers: {
      'Referer': 'https://www.bilibili.com/v/popular/all',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0',
    },
    retry: 5,
    retryDelay: 500,
  })
  if (code !== 0 || !('list' in data)) {
    console.error(`code: ${code}, message: ${message}`)
    throw new Error('获取数据失败')
  }
  for (const item of data.list) {
    result.push({
      aid: item.aid ?? 0,
      pic: item.pic ?? '',
      title: item.title ?? '',
      pubdate: item.pubdate ?? 0,
      ctime: item.ctime ?? 0,
      desc: item.desc ?? '',
      bvid: item.bvid ?? '',
    })
  }
  return result
}
