# Web Scraper Pro - Chrome Extension

A modern, beautiful Chrome extension for scraping web content with an intuitive user interface.

## Features

- 🎯 **Multiple Scraping Modes**
  - Scrape All Content (full page HTML & text)
  - Text Only (clean text extraction)
  - Images (with metadata)
  - Links (with titles and targets)

- 🎨 **Modern UI**
  - Dark theme with premium gradients
  - Smooth animations and transitions
  - Intuitive controls

- 📤 **Export Formats**
  - JSON
  - CSV
  - TXT

- ⚙️ **Advanced Options**
  - Include/exclude metadata
  - Remove scripts and styles
  - Copy to clipboard
  - Download as file

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `web_scraper_extension` folder
5. The extension icon should appear in your toolbar!

## Usage

1. Navigate to any webpage you want to scrape
2. Click the Web Scraper Pro icon in your toolbar
3. Choose your scraping mode:
   - **Scrape All Content**: Gets everything from the page
   - **Text Only**: Extracts clean text content
   - **Images**: Gets all images with their metadata
   - **Links**: Extracts all links from the page
4. Customize options if needed
5. Select your preferred export format (JSON, CSV, or TXT)
6. View results in the preview area
7. Copy to clipboard or download the data

## Project Structure

```
web_scraper_extension/
├── manifest.json       # Extension configuration
├── popup.html         # Extension popup UI
├── popup.css          # Styling with modern design
├── popup.js           # Popup logic and interactions
├── content.js         # Web scraping functionality
├── background.js      # Background service worker
├── icons/             # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md          # This file
```

## Development

The extension is built with vanilla JavaScript and follows Chrome Extension Manifest V3 standards.

### Key Files

- **manifest.json**: Defines extension permissions and configuration
- **popup.html/css/js**: The user interface
- **content.js**: Runs on web pages to extract content
- **background.js**: Service worker for background tasks

## Future Enhancements

- User authentication (planned)
- Cloud storage integration
- Custom selectors
- Scheduled scraping
- Export to more formats

## Privacy

This extension:
- Works entirely on the client side
- Does not send data to external servers
- Only accesses the active tab when you click scrape
- Stores settings locally in your browser

## License

MIT License - Feel free to use and modify as needed!
