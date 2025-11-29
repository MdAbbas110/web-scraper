// DOM Elements
const scrapeAllBtn = document.getElementById('scrapeAllBtn');
const scrapeTextBtn = document.getElementById('scrapeTextBtn');
const scrapeImagesBtn = document.getElementById('scrapeImagesBtn');
const scrapeLinksBtn = document.getElementById('scrapeLinksBtn');
const includeMetadataCheckbox = document.getElementById('includeMetadata');
const removeScriptsCheckbox = document.getElementById('removeScripts');
const formatBtns = document.querySelectorAll('.format-btn');
const resultsSection = document.getElementById('resultsSection');
const resultsContent = document.getElementById('resultsContent');
const itemCount = document.getElementById('itemCount');
const dataSize = document.getElementById('dataSize');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const statusBadge = document.getElementById('statusBadge');
const toast = document.getElementById('toast');

// State
let currentFormat = 'json';
let currentData = null;

// Event Listeners
scrapeAllBtn.addEventListener('click', () => scrapeContent('all'));
scrapeTextBtn.addEventListener('click', () => scrapeContent('text'));
scrapeImagesBtn.addEventListener('click', () => scrapeContent('images'));
scrapeLinksBtn.addEventListener('click', () => scrapeContent('links'));

formatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        formatBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFormat = btn.dataset.format;
        if (currentData) {
            displayResults(currentData);
        }
    });
});

copyBtn.addEventListener('click', copyToClipboard);
downloadBtn.addEventListener('click', downloadData);

// Main scraping function
async function scrapeContent(type) {
    try {
        updateStatus('scraping');

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab.id) {
            throw new Error('No active tab found');
        }

        // Check if we can access the tab (not a chrome:// or extension page)
        if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
            throw new Error('Cannot scrape Chrome internal pages');
        }

        const options = {
            type: type,
            includeMetadata: includeMetadataCheckbox.checked,
            removeScripts: removeScriptsCheckbox.checked
        };

        // Try to inject content script if not already loaded
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            });
            // Wait a brief moment for the script to initialize
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (injectionError) {
            // Script might already be injected, which is fine
            console.log('Content script injection note:', injectionError.message);
        }

        // Send message to content script
        const results = await chrome.tabs.sendMessage(tab.id, {
            action: 'scrape',
            options: options
        });

        currentData = results;
        displayResults(results);
        updateStatus('ready');
        showToast('Scraping completed successfully!');

    } catch (error) {
        console.error('Scraping error:', error);
        updateStatus('error');
        showToast('Error: ' + error.message, 'error');
    }
}

// Display results
function displayResults(data) {
    resultsSection.style.display = 'block';

    let formattedData;
    let itemCountValue = 0;

    switch (currentFormat) {
        case 'json':
            formattedData = JSON.stringify(data, null, 2);
            itemCountValue = Array.isArray(data.content) ? data.content.length :
                (data.images?.length || data.links?.length || 1);
            break;

        case 'csv':
            formattedData = convertToCSV(data);
            itemCountValue = data.content?.length || data.images?.length || data.links?.length || 0;
            break;

        case 'txt':
            formattedData = convertToText(data);
            itemCountValue = data.content?.length || data.images?.length || data.links?.length || 0;
            break;
    }

    resultsContent.textContent = formattedData;
    itemCount.textContent = itemCountValue;
    dataSize.textContent = formatBytes(new Blob([formattedData]).size);

    // Smooth scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Convert data to CSV
function convertToCSV(data) {
    if (data.images) {
        return 'URL,Alt Text,Width,Height\n' +
            data.images.map(img =>
                `"${img.src}","${img.alt || ''}","${img.width || ''}","${img.height || ''}"`
            ).join('\n');
    } else if (data.links) {
        return 'URL,Text\n' +
            data.links.map(link =>
                `"${link.href}","${link.text}"`
            ).join('\n');
    } else if (Array.isArray(data.content)) {
        return 'Content\n' + data.content.map(item => `"${item}"`).join('\n');
    } else {
        return `Title,URL,Content\n"${data.title}","${data.url}","${data.content}"`;
    }
}

// Convert data to plain text
function convertToText(data) {
    if (data.images) {
        return data.images.map((img, i) =>
            `Image ${i + 1}:\nURL: ${img.src}\nAlt: ${img.alt || 'N/A'}\n`
        ).join('\n');
    } else if (data.links) {
        return data.links.map((link, i) =>
            `Link ${i + 1}:\nURL: ${link.href}\nText: ${link.text}\n`
        ).join('\n');
    } else if (Array.isArray(data.content)) {
        return data.content.join('\n\n');
    } else {
        return `Title: ${data.title}\nURL: ${data.url}\n\nContent:\n${data.content}`;
    }
}

// Copy to clipboard
async function copyToClipboard() {
    try {
        await navigator.clipboard.writeText(resultsContent.textContent);
        showToast('Copied to clipboard!');
    } catch (error) {
        console.error('Copy error:', error);
        showToast('Failed to copy', 'error');
    }
}

// Download data
function downloadData() {
    const extensions = {
        'json': 'json',
        'csv': 'csv',
        'txt': 'txt'
    };

    const blob = new Blob([resultsContent.textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scraped-data-${Date.now()}.${extensions[currentFormat]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Download started!');
}

// Update status badge
function updateStatus(status) {
    statusBadge.className = 'status-badge';

    switch (status) {
        case 'scraping':
            statusBadge.classList.add('scraping');
            statusBadge.querySelector('span:last-child').textContent = 'Scraping...';
            break;
        case 'error':
            statusBadge.classList.add('error');
            statusBadge.querySelector('span:last-child').textContent = 'Error';
            setTimeout(() => updateStatus('ready'), 3000);
            break;
        default:
            statusBadge.querySelector('span:last-child').textContent = 'Ready';
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Format bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Initialize
updateStatus('ready');
