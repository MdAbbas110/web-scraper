// Content script for web scraping functionality
// Prevent multiple initializations
if (window.webScraperProInitialized) {
    console.log('Web Scraper Pro: Already initialized');
} else {
    window.webScraperProInitialized = true;
    console.log('Web Scraper Pro: Content script loaded');
}


// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scrape') {
        const result = performScraping(request.options);
        sendResponse(result);
        return true;
    }
});

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
    // Get main content areas
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

    // Extract paragraphs and headings
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

    // Filter out tracking pixels and tiny images
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

    // Remove duplicates and empty links
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

    // Get meta tags
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

// Helper function to clean text
function cleanText(text) {
    return text
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n')
        .trim();
}
