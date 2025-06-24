# Media Auto Downloader 🚀

A Node.js script that automatically scrapes and downloads all images and videos from a given webpage. It uses `puppeteer-core` to control a headless browser, ensuring that even dynamically loaded content is captured.

Made by **ChookyRocky** to **小满 :)**

[GitHub Repository](https://github.com/Ken-Razor)

---

## ✨ Features

* **Comprehensive Media Scraping**: Finds and downloads images (JPG, PNG, WEBP, GIF, SVG, AVIF) and videos (MP4, WEBM, MOV, OGG, etc.).
* **Dynamic Content Handling**: Scrolls the entire page and waits for lazy-loaded elements to ensure all media is discovered.
* **Smart URL Discovery**: Captures media from `<img>` tags, `<video>` tags, `srcset` attributes, and CSS `background-image` properties.
* **Organized Downloads**: Saves all media into a timestamped folder named after the website, with separate subdirectories for `images` and `videos`.
* **Flexible Browser Support**: Automatically finds an existing installation of Google Chrome or Microsoft Edge. It also allows you to specify a custom path to any Chromium-based browser.
* **Detailed Logging**: Provides an optional `DETAILED_LOGGING` mode to troubleshoot network requests and save a detailed log file.
* **User-Friendly**: Interactive command-line interface with clear, bilingual (English and Chinese) instructions.
* **Robust Downloading**: Includes progress indicators for large files and handles both standard URLs and Base64 data URIs.

## 📋 Requirements

Before you begin, ensure you have the following installed:

1.  **[Node.js](https://nodejs.org/)**: Required to run the JavaScript code. (Version 14.x or newer is recommended).
2.  **A Chromium-based Browser**: The script needs a browser like Google Chrome, Microsoft Edge, or a similar alternative. The script will try to find it automatically.
3.  **NPM (or Yarn)**: Node Package Manager, which comes bundled with Node.js, is used to install dependencies.

## ⚙️ Installation

1.  **Get the code**:
    Save the script code into a file named `index.js`.

2.  **Install Dependencies**:
    Open a terminal in the directory where you saved `index.js` and run the following command to install the necessary Node.js packages:
    ```bash
    npm install puppeteer-core
    ```

## 🚀 How to Use

1.  **Run the Script**:
    Execute the script from your terminal using Node.js:
    ```bash
    node index.js
    ```

2.  **Enter the URL**:
    The script will prompt you to enter the full URL of the webpage you want to scrape.
    ```
    ✔ Enter the page URL to scrape media (输入要抓取媒体的网址): [https://example.com](https://example.com)
    ```

3.  **Let the Magic Happen**:
    The script will launch a headless browser, navigate to the URL, scroll through the page, collect all media links, and download them.

4.  **Find Your Files**:
    Once finished, all downloaded media will be located in a newly created folder in the same directory as the script. The folder will be named like `media-example.com-YYYY-MM-DDTHH-MM-SS-SSSZ`.

## 🔧 Configuration (Optional)
You can customize the script's behavior by creating a `config.txt` file in the same directory as the script.

Create a file named `config.txt` and add the following options as needed:

```ini
# Set to true to enable detailed network logging for debugging purposes.
# This will create a log file with every network request.
DETAILED_LOGGING=false

# If the script cannot find your browser, or if you want to use a specific
# portable browser, provide the full path to its executable here.
# IMPORTANT: Use double backslashes (\\) for paths in Windows.
CUSTOM_BROWSER_PATH=C:\\Path\\To\\Your\\Browser\\chrome.exe
Example config.txt:
Ini, TOML

DETAILED_LOGGING=true
CUSTOM_BROWSER_PATH=C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe

```

## ⚠️ Disclaimer
This script is intended for personal and educational use only. Please be responsible and respect the terms of service and copyright policies of the websites you scrape. The developer is not responsible for any misuse of this tool. Always ensure you have permission to download and store content from a website.