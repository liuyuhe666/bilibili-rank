import { readFile, rm, writeFile } from 'fs/promises';
import { COMMNETS } from './constants';
import { timeZone, apiUrl } from './config';
import dayjs from 'dayjs';
import MarkdownIt from 'markdown-it';
import { minify } from 'html-minifier';
import axios from 'axios';
import * as rax from 'retry-axios';
import { htmlEncodeByRegExp } from './util';


rax.attach();
axios.defaults.raxConfig = {
  retry: 5,
  retryDelay: 4000,
  onRetryAttempt: (err) => {
    const cfg = rax.getConfig(err);
    console.log('request: \n', err.request);
    console.log(`Retry attempt #${cfg.currentRetryAttempt}`);
  },
};

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36 Edg/127.0.0.0';
const referer = 'https://www.bilibili.com';
axios.defaults.headers.common['User-Agent'] = userAgent;
axios.defaults.headers.common['Referer'] = referer;

const client = axios.create({
    baseURL: '',
    timeout: 4000,
});

client.interceptors.response.use(undefined, (err) => {
    console.log(err.message);
    return Promise.reject(err);
});

const md = new MarkdownIt({
    html: true,
});

function gc(token: keyof typeof COMMNETS) {
    return `<!-- ${COMMNETS[token]} -->`;
}

type ItemModel = {
    index: number,
    title: string,
    url: string
};

function generateItemHTML<T extends Partial<ItemModel>>(item: T) {
    return m`<li><span>${item.index} - <a href="${encodeURI(item.url)}">${htmlEncodeByRegExp(item.title)}</a></span></li>`
}

function m(html: TemplateStringsArray, ...args: any[]) {
    const str = html.reduce((s, h, i) => s + h + (args[i] ?? ''), '');
    return minify(str, {
      removeAttributeQuotes: true,
      removeEmptyAttributes: true,
      removeTagWhitespace: true,
      collapseWhitespace: true,
    }).trim();
}

async function main() {
    const template = await readFile('./README.template.md', { encoding: 'utf-8' });
    let newContent = template;
    // 注入 CONTENT
    {
        const data: any = await client.get(apiUrl).then((resp) => resp.data);
        const itemList: Array<any> = data.data.list;
        const res = itemList.reduce((acc, cur, index) => {
            const item: ItemModel = {
                index: index + 1,
                title: cur.title,
                url: `https://www.bilibili.com/${cur.bvid}`
            };
            return acc.concat(generateItemHTML(item));
        }, '');
        newContent = newContent.replace(
            gc('CONTENT'),
            m`<ul>${res}</ul>`
        );
    }

    // 注入 FOOTER
    {
        const now = new Date();
        const next = dayjs().add(6, 'h').toDate();

        newContent = newContent.replace(
            gc('FOOTER'),
            m`
                <p align="center">此页面<b>间隔 6 小时</b>自动刷新生成！
                </br>
                刷新于：${now.toLocaleString(undefined, {
                    timeStyle: 'short',
                    dateStyle: 'short',
                    timeZone,
                })}
                <br/>
                下一次刷新：${next.toLocaleString(undefined, {
                    timeStyle: 'short',
                    dateStyle: 'short',
                    timeZone,
                })}</p>
            `,
        );
    }

    await rm('./README.md', { force: true });
    await writeFile('./README.md', newContent, { encoding: 'utf-8' });

    let result = md.render(newContent);
    const htmlTemplate = await readFile('./index.template.html', { encoding: 'utf-8' });
    result = htmlTemplate.replace(
        gc('CONTENT'),
        `${result}`
    );
    await writeFile('./index.html', result, { encoding: 'utf-8' });
}

try {
    main();
} catch (e) {
    console.log(e);
}