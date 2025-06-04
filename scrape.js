import puppeteer from 'puppeteer';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import fetch from 'node-fetch';
import fs from 'fs/promises';

// Fetches all URLs from a sitemap XML file at the given URL
async function getSitemapUrls(sitemapUrl) {
  const response = await fetch(sitemapUrl);
  console.log('Status:', response.status);
  const xml = await response.text();
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${response.status} ${response.statusText}`);
  }
  // Parse the XML and extract all <loc> elements
  const dom = new JSDOM(xml, { contentType: "text/xml" });
  const locElements = dom.window.document.querySelectorAll('url > loc');
  let urls = Array.from(locElements).map(el => el.textContent.trim());
  return urls;
}

// Cleans HTML content by removing unwanted tags (e.g., images, scripts, SVGs)
// This helps preserve readable markup while stripping out non-essential or visual elements
function cleanHTMLContent(html, tagsToRemove = ['img', 'script', 'iframe', 'style', 'object', 'embed', 'circle', 'svg', 'rect']) {
  console.log("Cleaning HTML content");
  const dom = new JSDOM(html);
  const { document } = dom.window;
  tagsToRemove.forEach(tag => {
    document.querySelectorAll(tag).forEach(el => el.remove());
  });
  return document.body.innerHTML;
}

// Exports an array of article objects as a single HTML file, preserving markup for Google Docs or browser viewing
async function exportAsHTML(results, outputFile) {
  console.log("Exporting as HTML");
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset=\"UTF-8\">
      <title>Fora Financial Content</title>
    </head>
    <body>
  `;

  for (const article of results) {
    html += `
      <section style=\"margin-bottom: 40px;\">
        <h2><a href=\"${article.url}\">${article.title}</a></h2>
        ${article.content}
      </section>
    `;
  }

  html += `
    </body>
    </html>
  `;

  await fs.writeFile(outputFile, html, 'utf-8');
  console.log(`HTML results saved to ${outputFile}`);
}

// Main scraping function: loops through URLs, scrapes content with Puppeteer and Readability, cleans it, and exports as HTML
async function scrapeAndSave(urls, outputFileBase) {
  const browser = await puppeteer.launch();
  const results = [];

  for (const url of urls) {
    // Replace production domain with local domain for scraping
    let replacedUrl = url.replace('https://www.forafinancial.com', 'http://forafinancial.local:4000');
    let page;
    try {
      page = await browser.newPage();
      // Load the page and wait for DOM content
      await page.goto(replacedUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      const html = await page.content();
      // Use JSDOM and Readability to extract main article content
      const dom = new JSDOM(html, { url });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();

      results.push({
        url,
        title: article?.title || '',
        content: article?.content ? cleanHTMLContent(article.content) : ''
      });

      console.log(`Scraped: ${replacedUrl}`);
    } catch (err) {
      console.error(`Failed to scrape ${replacedUrl}:`, err.message);
    } finally {
      if (page) await page.close();
      // Add a delay to avoid overwhelming the server
      await new Promise(res => setTimeout(res, 600));
    }
  }

  await browser.close();
  // Export as HTML (can add JSON export if needed)
  await exportAsHTML(results, `${outputFileBase}.html`);
}

// Example usage: fetch sitemap, filter URLs, and start scraping/exporting
const sitemapUrl = 'http://forafinancial.local:4000/sitemap.xml';
getSitemapUrls(sitemapUrl).then(urls => {
  const excludedStrings = ['/blog/', '/case-studies/', '/browserconfig.xml'];
  console.log('Found URLs:', urls.length);
  console.log("filtering /blog/ and /case-studies/");
  let filteredUrls = urls.filter(url => url && !excludedStrings.some(str => url.includes(str)));
  console.log('Found URLs:', filteredUrls.length);
  scrapeAndSave(filteredUrls, `Fora_Financial_${Date.now()}`);
});