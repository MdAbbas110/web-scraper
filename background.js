// Background service worker
console.log('Web Scraper Pro: Background service worker initialized');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('Web Scraper Pro installed successfully');

        // Set default settings
        chrome.storage.sync.set({
            defaultFormat: 'json',
            includeMetadata: true,
            removeScripts: true
        });
    } else if (details.reason === 'update') {
        console.log('Web Scraper Pro updated to version', chrome.runtime.getManifest().version);
    }
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'saveData') {
        // Handle data saving if needed in the future
        chrome.storage.local.set({
            lastScrapedData: request.data,
            lastScrapedTime: Date.now()
        }, () => {
            sendResponse({ success: true });
        });
        return true;
    }

    if (request.action === 'getSettings') {
        chrome.storage.sync.get(['defaultFormat', 'includeMetadata', 'removeScripts'], (settings) => {
            sendResponse(settings);
        });
        return true;
    }
});

// Context menu for quick scraping (optional future feature)
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'quickScrape',
        title: 'Quick Scrape This Page',
        contexts: ['page']
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'quickScrape') {
        // Send message to content script to perform quick scrape
        chrome.tabs.sendMessage(tab.id, {
            action: 'scrape',
            options: {
                type: 'all',
                includeMetadata: true,
                removeScripts: true
            }
        });
    }
});

// Keep service worker alive
const keepAlive = () => setInterval(chrome.runtime.getPlatformInfo, 20000);
chrome.runtime.onStartup.addListener(keepAlive);
keepAlive();
