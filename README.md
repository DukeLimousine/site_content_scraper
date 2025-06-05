##Installation

Make sure you have node installed, version 18 or higher.

Clone the repo, cd into the directory, and install dependencies.

```
npm install
```

##Usage

```
node scrape.js
```

##Notes

- The script does not like scraping at localhost:4000. For the Forafinancial example, we use forafinancial.local:4000 which should be in your /etc/hosts file. I was not able to figure out how to scrape at common localhost domains or 127.0.0.1 for example. If this becomes an issue in the future it may need to be resolved.
- The script will scrape the sitemap.xml file and save the content of the URLs it contains to an HTML file in the current directory.
- HTML files are git ignored so you don't commit them to the repo.
- You can see some pretty obvious variables you can set in the script such as the sitemap URL, the output file name, tags to remove, urls to filter out, etc. We can update / customize these as needed.
- Can be used to scrape on the web, but you may need to adjust the timeout settings so you don't get rate limited.
