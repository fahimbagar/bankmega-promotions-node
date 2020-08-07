import { forkJoin, throwError } from 'rxjs';
import axios from 'axios';
import { RxHR, RxHttpRequestResponse } from '@akanass/rx-http-request';
import { delay, map, retryWhen, take } from 'rxjs/operators';

const cheerio = require('cheerio');

const BASE_URL = 'https://www.bankmega.com';
const PROMO = 'promolainnya.php';

export interface Category {
  id?: string
  pages?: number
  url?: string,
  contents?: Content[]
}

export interface Content {
  title?: string
  image?: string
  url?: string
  area?: string
  period?: string
  information?: string
  redirect?: string
}

async function LoadCategory(): Promise<Category[]> {
  const { body } = await RxHR.get(`${BASE_URL}/${PROMO}`).toPromise();
  let categories: Category[] = [];
  const elements = [];
  const $ = cheerio.load(body);
  $('#subcatpromo').children().each((i, elem) => {
    elements.push(elem.children[0].attribs.id);
  });
  const jsScript = $('#contentpromolain2 > div:nth-child(1) > script')[0].children[0].data;
  const script = jsScript.split('\n');

  for (let i = 0; i < script.length; i++) {
    if (new RegExp(elements.join('|')).test(script[i])) {
      categories.push({
        id: new RegExp(/\$\("#(.*?)"\)/).exec(script[i])[1],
        url: new RegExp(/load\("(.*?)"\)/).exec(script[i + 1])[1],
      });
      i++;
    }
  }
  categories = await forkJoin(categories.map(cat => {
    return GetPages(cat);
  })).toPromise();
  return categories;
}

async function GetPages(category: Category): Promise<Category> {
  const { body } = await RxHR.get(`${BASE_URL}/${category.url}`).toPromise();
  const $ = cheerio.load(body);
  const attribs = $('#paging1')[0].attribs;
  category.pages = parseInt(((attribs.title) as string).replace('Page 1 of ', ''), 10);
  return category;
}

async function GetContents(category: Category): Promise<Category> {
  const getContents$ = [];
  for (let i = 1; i <= category.pages; i++) {
    getContents$.push(RxHR.get(`${BASE_URL}/${category.url}&page=${i}`));
  }
  const responses = await forkJoin([...getContents$]).toPromise();
  const contents: Content[] = [];
  responses.forEach((r: RxHttpRequestResponse) => {
    const $ = cheerio.load(r.response.body);
    const content: Content[] = [];
    $('#promolain LI A').each((i, el) => {
      const image = $(el).children()[0].attribs.src as string;
      const link = $(el).attr('href') as string;
      contents.push({
        url: link.startsWith('http') ? link : `${BASE_URL}/${link}`,
        image: image.startsWith('http') ? image : `${BASE_URL}/${image}`,
      });
    });
    return content;
  });
  category.contents = contents;
  return category;
}

async function GetPromotions(category: Category, delayTimer: number = 0, maxRetries: number = 1) {
  console.log(`Start Promotions ${category.id}`)
  const getData$ = category.contents.map(content => {
    return RxHR.get(content.url).pipe(
      map(data => {
        return data.response.statusCode === 200 ? data : throwError('success was false')
      }),
      retryWhen(err => err.pipe(delay(delayTimer), take(maxRetries)))
    );
  });
  const responses = await forkJoin([...getData$]).toPromise();
  responses.forEach((r: RxHttpRequestResponse, index) => {
    const $ = cheerio.load(r.response.body);
    category.contents[index].title = $('#contentpromolain2 > div.titleinside').text().trim();
    category.contents[index].area = $('#contentpromolain2 > div.area > b').text().trim();
    category.contents[index].period = $('#contentpromolain2 > div.periode').text().replace(/(\r\n|\n|\r|\t)/gm, '').replace('Periode Promo : ', '');
    const ket = $('#contentpromolain2 > div.keteranganinside');
    if (ket.find('a').length > 0) {
      const redirect = ket.find('a')[0].attribs.href as string;
      category.contents[index].redirect = redirect.startsWith('http') ? redirect : `${BASE_URL}/${redirect}`;
    }
    const image = ket.find('img')[0].attribs.src as string;
    category.contents[index].information = image.startsWith('http') ? image : `${BASE_URL}${image}`;
  });
  console.log(`End Promotions ${category.id}`)
  return category;
}

export { LoadCategory, GetPages, GetContents, GetPromotions };
