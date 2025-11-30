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
let scrapedData = null;
let currentView = 'all'; // 'all', 'text', 'images', 'links'

// Event Listeners
scrapeAllBtn.addEventListener('click', () => performScrape('all'));
scrapeTextBtn.addEventListener('click', () => handleViewToggle('text'));
scrapeImagesBtn.addEventListener('click', () => handleViewToggle('images'));
scrapeLinksBtn.addEventListener('click', () => handleViewToggle('links'));

formatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        formatBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFormat = btn.dataset.format;
        if (scrapedData) {
            displayResults();
        }
    });
});

copyBtn.addEventListener('click', copyToClipboard);
downloadBtn.addEventListener('click', downloadData);

// Handle View Toggles
async function handleViewToggle(view) {
    currentView = view;
    // Update active state of buttons if needed (optional visual feedback)
    
    if (!scrapedData) {
        // If no data yet, trigger scrape
        await performScrape(view);
    } else {
        // Just update the display
        displayResults();
    }
}

// Main scraping function
async function performScrape(viewType) {
    try {
        updateStatus('scraping');
        
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab?.id) {
            throw new Error('No active tab found');
        }

        // Check if we can access the tab
        if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
            throw new Error('Cannot scrape Chrome internal pages');
        }

        // Inject scraper.js
        const injectionResults = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['scraper.js']
        });

        if (!injectionResults || !injectionResults[0] || !injectionResults[0].result) {
            throw new Error('Script injection failed or returned no data');
        }

        const result = injectionResults[0].result;

        if (!result.success) {
            throw new Error(result.error || 'Unknown scraping error');
        }

        scrapedData = result.data;
        currentView = viewType === 'all' ? 'all' : viewType;
        
        displayResults();
        updateStatus('ready');
        showToast('Scraping completed successfully!');

    } catch (error) {
        console.error('Scraping error:', error);
        updateStatus('error');
        showToast('Error: ' + error.message, 'error');
    }
}

// Display results based on current view and format
function displayResults() {
    if (!scrapedData) return;

    resultsSection.style.display = 'block';
    let contentToDisplay = '';
    let count = 0;

    // Determine what data to show based on currentView
    // Note: The requirements say:
    // Text: Show data.text
    // Images: Show list/count of data.images
    // Links: Show list/count of data.links
    // But we also need to respect the Export Format (JSON/CSV/TXT) for the PREVIEW?
    // Usually preview shows the text representation. 
    // Let's follow the logic:
    // If JSON format selected: Show full JSON of the current view data? Or full data object?
    // Requirement: "JSON: Download the full data object."
    // Requirement: "View Toggles... update the 'Results' preview area"
    
    // Let's interpret:
    // Preview always shows the data relevant to the view.
    // If JSON format is active, maybe show JSON string of that view?
    // Let's try to be smart.
    
    let dataToShow = scrapedData;
    
    if (currentView === 'text') {
        dataToShow = scrapedData.text;
        count = scrapedData.text ? scrapedData.text.length : 0; // Char count? Or just 1 item?
    } else if (currentView === 'images') {
        dataToShow = scrapedData.images;
        count = scrapedData.images ? scrapedData.images.length : 0;
    } else if (currentView === 'links') {
        dataToShow = scrapedData.links;
        count = scrapedData.links ? scrapedData.links.length : 0;
    } else {
        // 'all'
        dataToShow = scrapedData;
        count = (scrapedData.images?.length || 0) + (scrapedData.links?.length || 0);
    }

    // Format the output for display
    if (currentFormat === 'json') {
        contentToDisplay = JSON.stringify(dataToShow, null, 2);
    } else if (currentFormat === 'csv') {
        contentToDisplay = convertToCSV(dataToShow, currentView);
    } else if (currentFormat === 'txt') {
        contentToDisplay = convertToText(dataToShow, currentView);
    }

    resultsContent.textContent = contentToDisplay;
    
    // Update stats
    if (currentView === 'text') {
        itemCount.textContent = 'Text Content';
    } else {
        itemCount.textContent = count + ' items';
    }
    
    dataSize.textContent = formatBytes(new Blob([contentToDisplay]).size);

    // Smooth scroll
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Convert to CSV
function convertToCSV(data, view) {
    if (view === 'images' || (view === 'all' && Array.isArray(data.images))) {
        const imgs = view === 'images' ? data : data.images;
        if (!imgs || imgs.length === 0) return 'No images found';
        return 'URL,Alt,Width,Height\n' +
            imgs.map(img => `"${img.src}","${img.alt || ''}","${img.width || ''}","${img.height || ''}"`).join('\n');
    }
    
    if (view === 'links' || (view === 'all' && Array.isArray(data.links))) {
        const links = view === 'links' ? data : data.links;
        if (!links || links.length === 0) return 'No links found';
        return 'URL,Text\n' +
            links.map(link => `"${link.href}","${link.text.replace(/"/g, '""')}"`).join('\n');
    }

    if (view === 'text') {
        return 'Text Content\n"' + (typeof data === 'string' ? data.replace(/"/g, '""') : data) + '"';
    }

    // Fallback for 'all' if not specific
    return 'Error: Cannot convert complex object to CSV. Please select Images or Links view.';
}

// Convert to Text
function convertToText(data, view) {
    if (typeof data === 'string') return data;
    
    if (view === 'images' || (Array.isArray(data) && data.length > 0 && data[0].src)) {
        return data.map((img, i) => `Image ${i+1}: ${img.src} (${img.alt || 'No alt'})`).join('\n');
    }
    
    if (view === 'links' || (Array.isArray(data) && data.length > 0 && data[0].href)) {
        return data.map((link, i) => `Link ${i+1}: ${link.text} - ${link.href}`).join('\n');
    }

    if (view === 'all') {
        return `Title: ${data.title}\nURL: ${data.url}\n\nText Content:\n${data.text}\n\nImages: ${data.images?.length}\nLinks: ${data.links?.length}`;
    }

    return JSON.stringify(data, null, 2);
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
    if (!scrapedData) return;

    let content = '';
    let mimeType = 'text/plain';
    let extension = 'txt';
    let filename = 'scraped-data';

    // Requirement:
    // JSON: Download full data object
    // TXT: Download data.text
    // CSV: Generate from data.links or data.images (whichever view is active, or default to links)

    if (currentFormat === 'json') {
        content = JSON.stringify(scrapedData, null, 2);
        mimeType = 'application/json';
        extension = 'json';
    } else if (currentFormat === 'txt') {
        content = scrapedData.text || '';
        mimeType = 'text/plain';
        extension = 'txt';
        filename = 'scraped-text';
    } else if (currentFormat === 'csv') {
        // "whichever view is active, or default to links"
        let dataForCsv = scrapedData.links;
        let type = 'links';
        
        if (currentView === 'images') {
            dataForCsv = scrapedData.images;
            type = 'images';
        }
        
        content = convertToCSV(dataForCsv, type);
        mimeType = 'text/csv';
        extension = 'csv';
        filename = `scraped-${type}`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${Date.now()}.${extension}`;
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
