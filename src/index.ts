import axios from 'axios';
import { JSDOM } from 'jsdom';
import { DynamoDB } from 'aws-sdk';
import { sendEmail } from './utils/email';

const db = new DynamoDB.DocumentClient();

export async function handler(): Promise<boolean> {
  console.log('inside handler');
  const { Items } = await db.scan({ TableName: 'notification' }).promise();
  const items = Items.filter((i) => i.notified !== true);
  console.log(items);
  const job = items.map(checkPageAndSendEmail);
  const data = await Promise.all(job);
  console.log(data);
  return true;
}

async function checkPageAndSendEmail(setting) {
  /*
    'https://www.mantel.com/page-product-order-box.php?product_id=87936&spec[104]=2757'
    '#order-row > div:nth-child(3) > div.order_information.my-3.d-flex > button.btn-lg'
  */
  const { email, title, body, crawlUrl, selector, matchText } = setting;
  const { data: html } = await axios.get(crawlUrl);
  const dom = new JSDOM(html);
  let text: string;
  const el = dom.window.document.querySelector(selector as string);
  if (el) {
    text = el.textContent.trim();
    console.log('text found =>', text);
  }
  if (text === matchText) {
    console.log('matched! sending email and disabling notification');
    await sendEmail(email, title, body);
    const updatedItem = { ...setting, notified: true };
    await db
      .put({
        TableName: 'notification',
        Item: updatedItem
      })
      .promise();
  }
}
