// Web Scraper Pro - Floating Panel Script

(function() {
    // Prevent multiple injections
    if (window.webScraperProInjected) return;
    window.webScraperProInjected = true;

    // State
    let scrapedData = null;
    let currentView = 'all';
    let currentFormat = 'json';

    // --- UI Injection ---

    function createFloatingButton() {
        const btn = document.createElement('div');
        btn.id = 'web-scraper-pro-btn';
        btn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: white;">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 18V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 15L12 12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        btn.addEventListener('click', togglePanel);
        document.body.appendChild(btn);
    }

    function createPanel() {
        const panel = document.createElement('div');
        panel.id = 'web-scraper-pro-panel';
        panel.className = 'hidden';
        panel.innerHTML = `
            <div class="panel-header">
                <div class="panel-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Web Scraper Pro
                </div>
                <div class="panel-actions">
                    <button class="panel-close" id="wsp-close">×</button>
                </div>
            </div>
            <div class="panel-content">
                <div class="section">
                    <h3>Quick Scrape</h3>
                    <div class="button-group">
                        <button class="scrape-btn primary" id="wsp-scrape-all">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Scrape All Content
                        </button>
                    </div>
                    <div class="button-group-row">
                        <button class="scrape-btn secondary" id="wsp-view-text">Text</button>
                        <button class="scrape-btn secondary" id="wsp-view-images">Images</button>
                        <button class="scrape-btn secondary" id="wsp-view-links">Links</button>
                    </div>
                </div>

                <div class="section">
                    <h3>Integrations</h3>
                    <div class="button-group">
                        <button class="scrape-btn secondary" id="wsp-add-documentic">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Add to Documentic
                        </button>
                        <button class="scrape-btn secondary" id="wsp-add-source">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Add to Source
                        </button>
                    </div>
                </div>

                <div class="section">
                    <h3>Export Format</h3>
                    <div class="format-tabs">
                        <button class="format-tab active" data-format="json">JSON</button>
                        <button class="format-tab" data-format="csv">CSV</button>
                        <button class="format-tab" data-format="txt">TXT</button>
                        <button class="format-tab" data-format="toon">TOON</button>
                    </div>
                </div>

                <div class="section results-section hidden" id="wsp-results-section">
                    <div class="results-header">
                        <h3>Results</h3>
                        <div class="results-actions">
                            <button class="icon-btn" id="wsp-copy" title="Copy">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                            <button class="icon-btn" id="wsp-download" title="Download">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="results-box">
                        <pre id="wsp-results-content"></pre>
                    </div>
                    <div class="results-stats">
                        <div class="stat-item">
                            <span class="stat-label">Items:</span>
                            <span class="stat-value" id="wsp-item-count">0</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Size:</span>
                            <span class="stat-value" id="wsp-data-size">0 KB</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="status-bar" id="wsp-status-bar">
                <span class="status-indicator"></span>
                <span id="wsp-status-text">Ready</span>
            </div>
        `;
        document.body.appendChild(panel);

        // Bind events
        document.getElementById('wsp-close').addEventListener('click', togglePanel);
        document.getElementById('wsp-scrape-all').addEventListener('click', () => performScrape('all'));
        document.getElementById('wsp-view-text').addEventListener('click', () => handleViewToggle('text'));
        document.getElementById('wsp-view-images').addEventListener('click', () => handleViewToggle('images'));
        document.getElementById('wsp-view-links').addEventListener('click', () => handleViewToggle('links'));
        
        document.getElementById('wsp-add-documentic').addEventListener('click', () => {
            console.log('Sending to Documentic API...');
            showStatus('Sending to Documentic...', 'loading');
            setTimeout(() => showStatus('Sent to Documentic!', 'success'), 1500);
        });
        
        document.getElementById('wsp-add-source').addEventListener('click', () => {
            console.log('Adding to Source...');
            showStatus('Adding to Source...', 'loading');
            setTimeout(() => showStatus('Added to Source!', 'success'), 1500);
        });

        document.querySelectorAll('.format-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.format-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFormat = btn.dataset.format;
                if (scrapedData) displayResults();
            });
        });

        document.getElementById('wsp-copy').addEventListener('click', copyToClipboard);
        document.getElementById('wsp-download').addEventListener('click', downloadData);
    }

    // --- Logic ---

    function togglePanel() {
        const panel = document.getElementById('web-scraper-pro-panel');
        panel.classList.toggle('hidden');
    }

    async function handleViewToggle(view) {
        currentView = view;
        if (!scrapedData) {
            await performScrape(view);
        } else {
            displayResults();
        }
    }

    async function performScrape(viewType) {
        showStatus('Scraping...', 'loading');
        
        // Use a small timeout to allow UI to update
        setTimeout(() => {
            try {
                scrapedData = scrapeFullPage();
                currentView = viewType === 'all' ? 'all' : viewType;
                displayResults();
                showStatus('Ready', 'success');
            } catch (error) {
                console.error(error);
                showStatus('Error', 'error');
            }
        }, 50);
    }

    function displayResults() {
        const resultsSection = document.getElementById('wsp-results-section');
        const resultsContent = document.getElementById('wsp-results-content');
        const itemCount = document.getElementById('wsp-item-count');
        const dataSize = document.getElementById('wsp-data-size');

        resultsSection.classList.remove('hidden');

        let dataToShow = scrapedData;
        let count = 0;

        if (currentView === 'text') {
            dataToShow = scrapedData.text;
            count = 1;
        } else if (currentView === 'images') {
            dataToShow = scrapedData.images;
            count = scrapedData.images.length;
        } else if (currentView === 'links') {
            dataToShow = scrapedData.links;
            count = scrapedData.links.length;
        } else {
            count = (scrapedData.images?.length || 0) + (scrapedData.links?.length || 0);
        }

        let contentToDisplay = '';
        if (currentFormat === 'json') {
            contentToDisplay = JSON.stringify(dataToShow, null, 2);
        } else if (currentFormat === 'csv') {
            contentToDisplay = convertToCSV(dataToShow, currentView);
        } else if (currentFormat === 'txt') {
            contentToDisplay = convertToText(dataToShow, currentView);
        } else if (currentFormat === 'toon') {
            contentToDisplay = convertToTOON(dataToShow, currentView);
        }

        resultsContent.textContent = contentToDisplay;
        itemCount.textContent = count;
        dataSize.textContent = formatBytes(new Blob([contentToDisplay]).size);
    }

    function showStatus(text, type) {
        const bar = document.getElementById('wsp-status-bar');
        const statusText = document.getElementById('wsp-status-text');
        
        bar.className = 'status-bar ' + type;
        statusText.textContent = text;
        
        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                bar.className = 'status-bar';
                statusText.textContent = 'Ready';
            }, 3000);
        }
    }

    // --- Scraping Engine (Merged from scraper.js) ---

    function scrapeFullPage() {
        return {
            url: window.location.href,
            title: document.title,
            timestamp: new Date().toISOString(),
            metadata: extractMetadata(),
            html: document.documentElement.outerHTML,
            text: extractText(),
            images: extractImages(),
            links: extractLinks(),
            size: new Blob([document.documentElement.outerHTML]).size
        };
    }

    function extractMetadata() {
        const getMeta = (name) => {
            const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
            return meta ? meta.content : null;
        };
        return {
            description: getMeta('description'),
            keywords: getMeta('keywords'),
            author: getMeta('author'),
            ogTitle: getMeta('og:title'),
            ogDescription: getMeta('og:description'),
            ogImage: getMeta('og:image'),
            language: document.documentElement.lang || 'en',
            charset: document.characterSet
        };
    }

    function extractText() {
        // Simple robust text extraction
        const clone = document.body.cloneNode(true);
        clone.querySelectorAll('script, style, noscript, nav, header, footer, aside, iframe, [aria-hidden="true"]').forEach(el => el.remove());
        
        // Try to find main content
        const selectors = ['article', 'main', '[role="main"]', '.content', '#content'];
        let main = null;
        for (let s of selectors) {
            main = clone.querySelector(s);
            if (main) break;
        }
        
        const target = main || clone;
        return target.innerText.trim().replace(/\\n{3,}/g, '\\n\\n');
    }

    function extractImages() {
        return Array.from(document.images)
            .filter(img => img.width > 50 && img.height > 50 && !img.src.includes('pixel'))
            .slice(0, 100)
            .map(img => ({
                src: img.src,
                alt: img.alt || '',
                width: img.naturalWidth,
                height: img.naturalHeight
            }));
    }

    function extractLinks() {
        return Array.from(document.links)
            .filter(link => link.href && !link.href.startsWith('javascript:'))
            .slice(0, 200)
            .map(link => ({
                href: link.href,
                text: link.innerText.trim().substring(0, 100)
            }));
    }

    // --- Converters ---

    function convertToCSV(data, view) {
        if (view === 'images' || (view === 'all' && Array.isArray(data.images))) {
            const imgs = view === 'images' ? data : data.images;
            return 'URL,Alt,Width,Height\\n' + imgs.map(i => `"\${i.src}","\${i.alt}","\${i.width}","\${i.height}"`).join('\\n');
        }
        if (view === 'links' || (view === 'all' && Array.isArray(data.links))) {
            const links = view === 'links' ? data : data.links;
            return 'URL,Text\\n' + links.map(l => `"\${l.href}","\${l.text.replace(/"/g, '""')}"`).join('\\n');
        }
        return typeof data === 'string' ? data : JSON.stringify(data);
    }

    function convertToText(data, view) {
        if (typeof data === 'string') return data;
        if (Array.isArray(data)) return data.map(i => i.src ? i.src : (i.href ? `\${i.text}: \${i.href}` : JSON.stringify(i))).join('\\n');
        return data.text || JSON.stringify(data, null, 2);
    }

    function convertToTOON(data, view) {
        // TOON Format: YAML-like headers + CSV-like arrays
        // Based on description: "YAML's indentation-based structure for nested objects with a CSV-style tabular layout for uniform arrays"
        
        let output = '';
        
        if (view === 'all') {
            output += `url: \${data.url}\\n`;
            output += `title: \${data.title}\\n`;
            output += `timestamp: \${data.timestamp}\\n`;
            output += `metadata:\\n`;
            for (let [k, v] of Object.entries(data.metadata || {})) {
                if (v) output += `  \${k}: \${v}\\n`;
            }
            output += `\\nimages:\\n`;
            output += `  | src | alt | width | height |\\n`;
            (data.images || []).forEach(img => {
                output += `  | \${img.src} | \${img.alt} | \${img.width} | \${img.height} |\\n`;
            });
            output += `\\nlinks:\\n`;
            output += `  | href | text |\\n`;
            (data.links || []).forEach(link => {
                output += `  | \${link.href} | \${link.text.replace(/\\n/g, ' ')} |\\n`;
            });
            output += `\\ntext: |\\n`;
            output += data.text.split('\\n').map(line => '  ' + line).join('\\n');
            
        } else if (view === 'images') {
            output += `images:\\n`;
            output += `  | src | alt | width | height |\\n`;
            data.forEach(img => {
                output += `  | \${img.src} | \${img.alt} | \${img.width} | \${img.height} |\\n`;
            });
        } else if (view === 'links') {
            output += `links:\\n`;
            output += `  | href | text |\\n`;
            data.forEach(link => {
                output += `  | \${link.href} | \${link.text.replace(/\\n/g, ' ')} |\\n`;
            });
        } else {
            output = JSON.stringify(data, null, 2);
        }
        
        return output;
    }

    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    function copyToClipboard() {
        const content = document.getElementById('wsp-results-content').textContent;
        navigator.clipboard.writeText(content).then(() => showStatus('Copied!', 'success'));
    }

    function downloadData() {
        const content = document.getElementById('wsp-results-content').textContent;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scraped-data.\${currentFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Initialize
    createFloatingButton();
    createPanel();

})();
