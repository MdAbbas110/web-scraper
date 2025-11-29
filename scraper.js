// Main scraping function
function scrapeFullPage() {
  try {
    const data = {
      url: window.location.href,
      title: document.title,
      timestamp: new Date().toISOString(),
      
      // Metadata extraction
      metadata: extractMetadata(),
      
      // Content extraction
      html: document.documentElement.outerHTML,
      text: extractText(),
      
      // Additional data
      images: extractImages(),
      links: extractLinks(),
      
      // Size calculation
      size: new Blob([document.documentElement.outerHTML]).size
    };

    return {
      success: true,
      data: data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Extract meta tags
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

// Extract text content (Robust version from content.js)
function extractText() {
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

    if (!contentElement) return document.body.innerText;

    const clone = contentElement.cloneNode(true);
    
    // Remove non-content elements
    clone.querySelectorAll('script, style, noscript, nav, header, footer, aside, iframe, [aria-hidden="true"]').forEach(el => el.remove());

    // Extract paragraphs and headings for cleaner structure
    const textElements = clone.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li');
    
    if (textElements.length > 0) {
        return Array.from(textElements)
            .map(el => el.innerText.trim())
            .filter(text => text.length > 0)
            .join('\n\n');
    }

    return clone.innerText.trim();
}

// Extract all images (Robust version with filtering)
function extractImages() {
  const images = Array.from(document.images).map(img => ({
      src: img.src,
      alt: img.alt || '',
      title: img.title || '',
      width: img.naturalWidth,
      height: img.naturalHeight
    }));

    // Filter out tracking pixels and tiny images
    return images.filter(img =>
        img.width > 50 && img.height > 50 &&
        !img.src.includes('tracking') &&
        !img.src.includes('pixel')
    ).slice(0, 100); // Limit to 100 relevant images
}

// Extract all links (Robust version with deduplication)
function extractLinks() {
  const links = Array.from(document.links).map(link => ({
      href: link.href,
      text: link.innerText.trim().substring(0, 100),
      title: link.title || ''
    }));

    // Remove duplicates and empty links
    return links.filter((link, index, self) =>
        link.href && link.text &&
        !link.href.startsWith('javascript:') &&
        !link.href.startsWith('mailto:') &&
        index === self.findIndex(l => l.href === link.href)
    ).slice(0, 200); // Limit to 200 unique links
}

// Execute scraping based on mode
(function() {
  // This function is called when script is injected
  const result = scrapeFullPage();
  return result;
})();
