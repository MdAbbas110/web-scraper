// Content script for web scraping functionality
// Prevent multiple initializations
if (window.webScraperProInitialized) {
    console.log('Web Scraper Pro: Already initialized');
} else {
    window.webScraperProInitialized = true;
    console.log('Web Scraper Pro: Content script loaded');

    // Initialize floating panel
    initFloatingPanel();
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scrape') {
        const result = performScraping(request.options);
        sendResponse(result);
        return true;
    }
});

// Initialize floating panel UI
function initFloatingPanel() {
    // Create floating button
    const floatingBtn = document.createElement('div');
    floatingBtn.id = 'web-scraper-pro-btn';
    floatingBtn.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 2V8H20" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 18V12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9 15L12 12L15 15" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

    // Create floating panel
    const floatingPanel = document.createElement('div');
    floatingPanel.id = 'web-scraper-pro-panel';
    floatingPanel.className = 'hidden';
    floatingPanel.innerHTML = `
    <div class="panel-header" id="panel-header">
      <div class="panel-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Web Scraper Pro</span>
      </div>
      <div class="panel-actions">
        <button class="panel-minimize" id="panel-minimize" title="Minimize">−</button>
        <button class="panel-close" id="panel-close" title="Close">×</button>
      </div>
    </div>
    <div class="panel-content">
      <div class="section">
        <h3>Quick Scrape</h3>
        <div class="button-group">
          <button class="scrape-btn primary" data-type="all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Scrape All
          </button>
        </div>
        <div class="button-group-row">
          <button class="scrape-btn secondary" data-type="text">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Text
          </button>
          <button class="scrape-btn secondary" data-type="images">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
              <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="2"/>
              <path d="M21 15L16 10L5 21" stroke="currentColor" stroke-width="2"/>
            </svg>
            Images
          </button>
          <button class="scrape-btn secondary" data-type="links">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.45791 20.4791 3.53087C19.5521 2.60383 18.298 2.07799 16.987 2.0666C15.676 2.0552 14.413 2.55918 13.47 3.46997L11.75 5.17997" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Links
          </button>
        </div>
      </div>
      
      <div class="section">
        <h3>Export Format</h3>
        <div class="format-tabs">
          <button class="format-tab active" data-format="json">JSON</button>
          <button class="format-tab" data-format="csv">CSV</button>
          <button class="format-tab" data-format="txt">TXT</button>
        </div>
      </div>
      
      <div class="section results-section hidden" id="results-section">
        <div class="results-header">
          <h3>Results</h3>
          <div class="results-actions">
            <button class="icon-btn" id="copy-results" title="Copy">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2"/>
                <path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
            <button class="icon-btn" id="download-results" title="Download">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2"/>
                <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 15V3" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="results-box">
          <pre id="results-content"></pre>
        </div>
        <div class="results-stats">
          <span>Items: <strong id="item-count">0</strong></span>
          <span>Size: <strong id="data-size">0 KB</strong></span>
        </div>
      </div>
      
      <div class="status-bar" id="status-bar">
        <div class="status-indicator"></div>
        <span id="status-text">Ready to scrape</span>
      </div>
    </div>
  `;

    // Inject styles
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = chrome.runtime.getURL('scraper-panel.css');
    document.head.appendChild(styleLink);

    // Append to body
    document.body.appendChild(floatingBtn);
    document.body.appendChild(floatingPanel);

    // Initialize panel functionality
    initPanelInteractions(floatingBtn, floatingPanel);
}

// Panel interactions
function initPanelInteractions(btn, panel) {
    let isDragging = false;
    let currentX, currentY, initialX, initialY;
    let xOffset = 0, yOffset = 0;

    // Toggle panel
    btn.addEventListener('click', () => {
        panel.classList.toggle('hidden');
        if (!panel.classList.contains('hidden')) {
            btn.style.display = 'none';
        }
    });

    // Minimize panel
    document.getElementById('panel-minimize').addEventListener('click', () => {
        panel.classList.add('hidden');
        btn.style.display = 'flex';
    });

    // Close panel
    document.getElementById('panel-close').addEventListener('click', () => {
        panel.classList.add('hidden');
        btn.style.display = 'flex';
    });

    // Make button draggable
    btn.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        if (e.target === btn || btn.contains(e.target)) {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            isDragging = true;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            xOffset = currentX;
            yOffset = currentY;
            setTranslate(currentX, currentY, btn);
        }
    }

    function dragEnd() {
        isDragging = false;
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate(${xPos}px, ${yPos}px)`;
    }

    // Scrape buttons
    document.querySelectorAll('.scrape-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const type = e.currentTarget.dataset.type;
            await handleScrape(type);
        });
    });

    // Format tabs
    document.querySelectorAll('.format-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.format-tab').forEach(t => t.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentFormat = e.currentTarget.dataset.format;
            if (currentData) {
                displayPanelResults(currentData);
            }
        });
    });

    // Copy/Download
    document.getElementById('copy-results').addEventListener('click', copyPanelResults);
    document.getElementById('download-results').addEventListener('click', downloadPanelResults);
}

let currentFormat = 'json';
let currentData = null;

// Handle scraping
async function handleScrape(type) {
    const statusBar = document.getElementById('status-bar');
    const statusText = document.getElementById('status-text');

    statusBar.classList.add('loading');
    statusText.textContent = 'Scraping...';

    try {
        const options = { type, includeMetadata: true, removeScripts: true };
        const result = performScraping(options);
        currentData = result;
        displayPanelResults(result);

        statusBar.classList.remove('loading');
        statusBar.classList.add('success');
        statusText.textContent = 'Scraping completed!';

        setTimeout(() => {
            statusBar.classList.remove('success');
            statusText.textContent = 'Ready to scrape';
        }, 2000);
    } catch (error) {
        statusBar.classList.remove('loading');
        statusBar.classList.add('error');
        statusText.textContent = 'Error: ' + error.message;
    }
}

// Display results in panel
function displayPanelResults(data) {
    const resultsSection = document.getElementById('results-section');
    const resultsContent = document.getElementById('results-content');
    const itemCount = document.getElementById('item-count');
    const dataSize = document.getElementById('data-size');

    resultsSection.classList.remove('hidden');

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
}

// Copy results
async function copyPanelResults() {
    const resultsContent = document.getElementById('results-content');
    try {
        await navigator.clipboard.writeText(resultsContent.textContent);
        showPanelToast('Copied to clipboard!');
    } catch (error) {
        showPanelToast('Failed to copy', true);
    }
}

// Download results
function downloadPanelResults() {
    const resultsContent = document.getElementById('results-content');
    const extensions = { 'json': 'json', 'csv': 'csv', 'txt': 'txt' };

    const blob = new Blob([resultsContent.textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scraped-data-${Date.now()}.${extensions[currentFormat]}`;
    a.click();
    URL.revokeObjectURL(url);

    showPanelToast('Download started!');
}

// Show toast
function showPanelToast(message, isError = false) {
    const statusBar = document.getElementById('status-bar');
    const statusText = document.getElementById('status-text');

    if (isError) {
        statusBar.classList.add('error');
    } else {
        statusBar.classList.add('success');
    }

    statusText.textContent = message;

    setTimeout(() => {
        statusBar.classList.remove('error', 'success');
        statusText.textContent = 'Ready to scrape';
    }, 2000);
}

// Main scraping function
function performScraping(options) {
    const { type, includeMetadata, removeScripts } = options;

    try {
        let data = {};

        switch (type) {
            case 'all':
                data = scrapeAll(includeMetadata, removeScripts);
                break;
            case 'text':
                data = scrapeText(includeMetadata);
                break;
            case 'images':
                data = scrapeImages();
                break;
            case 'links':
                data = scrapeLinks();
                break;
            default:
                data = scrapeAll(includeMetadata, removeScripts);
        }

        return data;

    } catch (error) {
        console.error('Scraping error:', error);
        throw new Error('Failed to scrape content: ' + error.message);
    }
}

// Scrape all content
function scrapeAll(includeMetadata, removeScripts) {
    const body = document.body.cloneNode(true);

    if (removeScripts) {
        body.querySelectorAll('script, style, noscript').forEach(el => el.remove());
    }

    const data = {
        url: window.location.href,
        title: document.title,
        content: body.innerText.trim(),
        html: body.innerHTML,
        timestamp: new Date().toISOString()
    };

    if (includeMetadata) {
        data.metadata = extractMetadata();
    }

    return data;
}

// Scrape text only
function scrapeText(includeMetadata) {
    const selectors = [
        'article',
        'main',
        '[role="main"]',
        '.content',
        '.main-content',
        '#content',
        'body'
    ];

    let contentElement = null;
    for (const selector of selectors) {
        contentElement = document.querySelector(selector);
        if (contentElement) break;
    }

    const clone = contentElement.cloneNode(true);
    clone.querySelectorAll('script, style, noscript, nav, header, footer, aside').forEach(el => el.remove());

    const textElements = clone.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li');
    const textContent = Array.from(textElements)
        .map(el => el.innerText.trim())
        .filter(text => text.length > 0);

    const data = {
        url: window.location.href,
        title: document.title,
        content: textContent,
        fullText: clone.innerText.trim(),
        timestamp: new Date().toISOString()
    };

    if (includeMetadata) {
        data.metadata = extractMetadata();
    }

    return data;
}

// Scrape images
function scrapeImages() {
    const images = Array.from(document.images).map(img => ({
        src: img.src,
        alt: img.alt || '',
        title: img.title || '',
        width: img.naturalWidth,
        height: img.naturalHeight
    }));

    const validImages = images.filter(img =>
        img.width > 50 && img.height > 50 &&
        !img.src.includes('tracking') &&
        !img.src.includes('pixel')
    );

    return {
        url: window.location.href,
        title: document.title,
        images: validImages,
        timestamp: new Date().toISOString()
    };
}

// Scrape links
function scrapeLinks() {
    const links = Array.from(document.links).map(link => ({
        href: link.href,
        text: link.textContent.trim(),
        title: link.title || '',
        target: link.target || '_self'
    }));

    const uniqueLinks = links.filter((link, index, self) =>
        link.href && link.text &&
        index === self.findIndex(l => l.href === link.href)
    );

    return {
        url: window.location.href,
        title: document.title,
        links: uniqueLinks,
        timestamp: new Date().toISOString()
    };
}

// Extract metadata
function extractMetadata() {
    const metadata = {
        description: '',
        keywords: '',
        author: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        language: document.documentElement.lang || 'en',
        charset: document.characterSet
    };

    const metaTags = document.getElementsByTagName('meta');
    for (const tag of metaTags) {
        const name = tag.getAttribute('name') || tag.getAttribute('property');
        const content = tag.getAttribute('content');

        if (!name || !content) continue;

        switch (name.toLowerCase()) {
            case 'description':
                metadata.description = content;
                break;
            case 'keywords':
                metadata.keywords = content;
                break;
            case 'author':
                metadata.author = content;
                break;
            case 'og:title':
                metadata.ogTitle = content;
                break;
            case 'og:description':
                metadata.ogDescription = content;
                break;
            case 'og:image':
                metadata.ogImage = content;
                break;
        }
    }

    return metadata;
}

// Convert to CSV
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

// Convert to text
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

// Format bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
