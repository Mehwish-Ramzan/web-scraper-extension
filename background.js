chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "download") {
    const dataUrl = "data:" + msg.mime + ";charset=utf-8," + encodeURIComponent(msg.data);

    chrome.downloads.download(
      {
        url: dataUrl,
        filename: msg.filename,
        saveAs: true
      },
      () => {
        chrome.runtime.sendMessage({ type: "downloadComplete", filename: msg.filename });
      }
    );

    sendResponse({ status: "started" });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log("Web Scraper Installed!");
});
