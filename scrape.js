import puppeteer from 'puppeteer';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import fetch from 'node-fetch';


async function getSitemapUrls(sitemapUrl) {
  const response = await fetch(sitemapUrl);
  console.log('Status:', response.status);
  const xml = await response.text();
  console.log('First 500 chars:', xml.slice(0, 500));
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${response.status} ${response.statusText}`);
  }
  const dom = new JSDOM(xml, { contentType: "text/xml" });
  const locElements = dom.window.document.querySelectorAll('url > loc');
  const urls = Array.from(locElements).map(el => el.textContent.trim());
  return urls;
}

// Example usage:
const sitemapUrl = 'http://forafinancial.local:4000/sitemap.xml';
getSitemapUrls(sitemapUrl).then(urls => {
    console.log('Found URLs:', urls);
});