##Installation

Make sure you have node installed, version 18 or higher.

Clone the repo, cd into the directory, and install dependencies.

```
npm install
```

##Usage

If you want to scrape a list of urls from a file, you can do so by passing the relative file path as an argument.

The script will scrape the sitemap.xml file and save the content of the URLs OR the urls contained in the argument file to an HTML file in the current directory.

```
node scrape.js <arg1(optional)>
```

##Notes

- The script does not like scraping at localhost:4000. For the Forafinancial example, we use forafinancial.local:4000 which should be in your /etc/hosts file. I was not able to figure out how to scrape at common localhost domains or 127.0.0.1 for example. If this becomes an issue in the future it may need to be resolved.
- HTML files are git ignored so you don't commit them to the repo.
- You can see some pretty obvious variables you can set in the script such as the sitemap URL, the output file name, tags to remove, urls to filter out, etc. We can update / customize these as needed.
- Can be used to scrape on the web, but you may need to adjust the timeout settings so you don't get rate limited.
- Corner case, but clear your browser cache before running the script, otherwise you may get cached content.
