const scrapeBtn = document.getElementById("scrapeBtn");
const copyBtn = document.getElementById("copyBtn");
const downloadJsonBtn = document.getElementById("downloadJsonBtn");
const downloadCsvBtn = document.getElementById("downloadCsvBtn");
const historyBtn = document.getElementById("historyBtn");
const darkModeBtn = document.getElementById("darkModeBtn");
const output = document.getElementById("output");

const historyModal = document.getElementById("historyModal");
const closeHistory = document.getElementById("closeHistory");
const historyList = document.getElementById("historyList");
const clearHistory = document.getElementById("clearHistory");

let scrapedData = [];

// SCRAPE
scrapeBtn.addEventListener("click", () => {
  const options = {
    type: document.getElementById("type").value,
    filter: document.getElementById("filter").value,
    limit: parseInt(document.getElementById("limit").value) || null
  };

  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        files: ["content.js"]
      },
      () => {
        chrome.tabs.sendMessage(tabs[0].id, { type: "scrape", options }, res => {
          scrapedData = res.data;
          output.textContent = JSON.stringify(scrapedData, null, 2);

          // Save history
          chrome.storage.local.get({ history: [] }, result => {
            let history = result.history;
            history.unshift({ date: new Date().toLocaleString(), data: scrapedData });
            if (history.length > 5) history.pop();
            chrome.storage.local.set({ history });
          });
        });
      }
    );
  });
});

// COPY
copyBtn.addEventListener("click", () => {
  if (!scrapedData.length) return alert("⚠️ No data to copy!");
  navigator.clipboard.writeText(JSON.stringify(scrapedData, null, 2));
  alert("✅ Copied to clipboard!");
});

// DOWNLOAD JSON
downloadJsonBtn.addEventListener("click", () => {
  if (!scrapedData.length) return alert("⚠️ No data to download!");
  const json = JSON.stringify(scrapedData, null, 2);
  chrome.runtime.sendMessage({
    type: "download",
    data: json,
    mime: "application/json",
    filename: "scraped-data.json"
  });
});

// DOWNLOAD CSV
downloadCsvBtn.addEventListener("click", () => {
  if (!scrapedData.length) return alert("⚠️ No data to download!");
  const csv = scrapedData.map((item, i) => `"${i+1}","${item}"`).join("\n");
  chrome.runtime.sendMessage({
    type: "download",
    data: csv,
    mime: "text/csv",
    filename: "scraped-data.csv"
  });
});


// Open history modal
historyBtn.addEventListener("click", () => {
  historyModal.style.display = "block";
  loadHistory();
});

// Close modal
closeHistory.addEventListener("click", () => {
  historyModal.style.display = "none";
});

// Close when clicking outside
window.addEventListener("click", (e) => {
  if (e.target === historyModal) {
    historyModal.style.display = "none";
  }
});

// Load history from storage
function loadHistory() {
  chrome.storage.local.get({ history: [] }, result => {
    historyList.innerHTML = "";
    if (!result.history.length) {
      historyList.innerHTML = "<li>No history yet</li>";
    } else {
      result.history.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `[${item.date}] ${JSON.stringify(item.data).slice(0, 50)}...`;
        historyList.appendChild(li);
      });
    }
  });
}

// Clear history
clearHistory.addEventListener("click", () => {
  chrome.storage.local.set({ history: [] }, () => {
    historyList.innerHTML = "<li>History cleared</li>";
  });
});


// DARK MODE
darkModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  chrome.storage.local.set({ darkMode: document.body.classList.contains("dark") });
});

// Apply saved dark mode on load
chrome.storage.local.get("darkMode", result => {
  if (result.darkMode) {
    document.body.classList.add("dark");
  }
});

// Download complete feedback
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "downloadComplete") {
    alert("✅ Data downloaded as " + msg.filename);
  }
});
