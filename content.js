function scrapeData(options) {
  let results = [];

  if (options.type === "links") {
    document.querySelectorAll("a").forEach(a => {
      if (!options.filter || a.href.includes(options.filter)) {
        results.push(a.href);
        a.style.outline = "2px solid orange"; // highlight scraped
      }
    });
  }

  if (options.type === "images") {
    document.querySelectorAll("img").forEach(img => {
      if (!options.filter || img.src.includes(options.filter)) {
        results.push(img.src);
        img.style.outline = "2px solid green";
      }
    });
  }

  if (options.type === "text") {
    document.querySelectorAll("p,h1,h2,h3").forEach(el => {
      if (!options.filter || el.innerText.includes(options.filter)) {
        results.push(el.innerText.trim());
        el.style.backgroundColor = "yellow";
      }
    });
  }

  if (options.limit && results.length > options.limit) {
    results = results.slice(0, options.limit);
  }

  return results;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "scrape") {
    const data = scrapeData(msg.options);
    sendResponse({ data });
  }
});
