const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");
const https = require("https");
const readline = require("readline");

// --- FUNGSI UNTUK MEMBACA KONFIGURASI DARI config.txt ---
// create a file named 'config.txt' in the same folder for controlling this script.
// example --> config.txt:
//
// DETAILED_LOGGING=true
// CUSTOM_BROWSER_PATH=C:\\Program Files\\Zhanfu\\zhanfu.exe
//
const loadConfig = () => {
  const config = {
    DETAILED_LOGGING: false,
    CUSTOM_BROWSER_PATH: "", // Default value
  };
  try {
    const configPath = path.join(process.cwd(), "config.txt");
    if (fs.existsSync(configPath)) {
      const fileContent = fs.readFileSync(configPath, "utf8");
      fileContent.split(/\r?\n/).forEach((line) => {
        // Handles Windows and Linux line endings
        const parts = line.split("=");
        if (parts.length === 2) {
          const key = parts[0].trim();
          const value = parts[1].trim();
          if (key === "DETAILED_LOGGING") {
            config.DETAILED_LOGGING = value.toLowerCase() === "true";
          } else if (key === "CUSTOM_BROWSER_PATH") {
            config.CUSTOM_BROWSER_PATH = value;
          }
        }
      });
    }
  } catch (e) {
    console.log("[WARN] Could not read config.txt, using default settings.");
  }
  return config;
};

const showHeader = () => {
  console.log(
    "***************************************************************"
  );
  console.log(
    "***************************************************************"
  );
  console.log("* 😊  😢  💔  Media Auto Downloader   💔  😢  😊 *");
  console.log(
    "***************************************************************"
  );
  console.log(
    "*                 Made by ChookyRocky to 小满 :)               *"
  );
  console.log(
    "*             Github: https://github.com/Ken-Razor            *"
  );
  console.log(
    "***************************************************************\n"
  );
};

const downloadMedia = (url, filepath, referer) => {
  return new Promise((resolve, reject) => {
    if (url.startsWith("data:")) {
      try {
        const [header, body] = url.split(",");
        const mediaType = header.match(/\/(.*?);/)?.[1] || "bin";
        const data = Buffer.from(body, "base64");
        if (!path.extname(filepath)) filepath += `.${mediaType}`;
        fs.writeFile(filepath, data, (err) => (err ? reject(err) : resolve()));
      } catch (err) {
        reject(new Error("Failed to parse data URL."));
      }
      return;
    }
    try {
      const requestUrl = new URL(url);
      const options = {
        headers: {
          Referer: referer,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
          Accept:
            "video/webm,video/ogg,video/*;q=0.9,image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        },
      };
      https
        .get(requestUrl, options, (res) => {
          if (res.statusCode < 200 || res.statusCode >= 300)
            return reject(
              new Error(`Server responded with status code: ${res.statusCode}`)
            );
          const totalSize = parseInt(res.headers["content-length"], 10);
          let downloadedSize = 0;
          const fileStream = fs.createWriteStream(filepath);
          res.on("data", (chunk) => {
            downloadedSize += chunk.length;
            if (totalSize) {
              const percentage = ((downloadedSize / totalSize) * 100).toFixed(
                2
              );
              const downloadedMb = (downloadedSize / 1024 / 1024).toFixed(2);
              const totalMb = (totalSize / 1024 / 1024).toFixed(2);
              process.stdout.write(
                `  ↳ Downloading ${path.basename(
                  filepath
                )}: ${percentage}% (${downloadedMb}MB / ${totalMb}MB)\r`
              );
            }
          });
          res.pipe(fileStream);
          fileStream.on("finish", () => {
            process.stdout.write("\n");
            fileStream.close(resolve);
          });
          fileStream.on("error", (err) =>
            fs.unlink(filepath, () => reject(err))
          );
        })
        .on("error", (err) => reject(err));
    } catch (err) {
      reject(new Error(`Invalid URL: ${url}`));
    }
  });
};

const promptUrl = () => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(
      "✔ Enter the page URL to scrape media (输入要抓取媒体的网址): ",
      (answer) => {
        rl.close();
        resolve(answer.trim());
      }
    );
  });
};

const findChrome = () => {
  const possiblePaths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    process.env.LOCALAPPDATA + "\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome-stable",
  ];
  for (const chromePath of possiblePaths)
    if (fs.existsSync(chromePath)) return chromePath;
  throw new Error(
    "Standard Chrome/Edge not found. Please provide a path using CUSTOM_BROWSER_PATH in config.txt."
  );
};

const imageRegex = /\.(jpe?g|png|webp|gif|svg|bmp|avif)$/i;
const videoRegex = /\.(mp4|webm|mov|ogg|wmv|mkv|flv)$/i;

async function run() {
  const config = loadConfig();
  let logStream = null;

  if (config.DETAILED_LOGGING) {
    const logFilename = `log-${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.txt`;
    logStream = fs.createWriteStream(logFilename);
    console.log(
      `[!!!] DETAILED LOGGING ENABLED. Log will be saved to: ${logFilename}`
    );
    console.log(`[!!!] 日志记录已启用. 日志将保存到: ${logFilename}\n`);
  }

  const log = (message) => {
    const timestamp = `[${new Date().toLocaleTimeString("en-GB")}]`;
    const logMessage = `${timestamp} ${message}`;
    console.log(message);
    if (logStream) logStream.write(logMessage + "\n");
  };

  const exitAfterDelay = (seconds) => {
    log("\n✨ All tasks completed. (✨ 所有任务已完成。)");
    let counter = seconds;
    const intervalId = setInterval(() => {
      process.stdout.write(
        `\rAuto-closing in ${counter} second(s)... (将在 ${counter} 秒后自动关闭...)  `
      );
      counter--;
      if (counter < 0) {
        clearInterval(intervalId);
        process.stdout.write("\nGoodbye! (再见!)\n");
        process.exit(0);
      }
    }, 1000);
  };

  showHeader();
  const targetUrl = await promptUrl();

  if (!/^https?:\/\/.+/i.test(targetUrl)) {
    log(
      "❌ Invalid URL. Must start with http:// or https:// (❌ 无效的链接，必须以 http:// 或 https:// 开头)"
    );
    return;
  }

  log(
    "\n🤖 Please wait, preparing the browser... (🤖 请稍等，正在准备浏览器...)"
  );
  let browser;
  try {
    let executablePath;
    const customPathFromConfig = config.CUSTOM_BROWSER_PATH;

    if (customPathFromConfig && fs.existsSync(customPathFromConfig)) {
      executablePath = customPathFromConfig;
      log(
        `✅ Using custom browser from config.txt: ${executablePath} (使用自定义浏览器)`
      );
    } else {
      if (customPathFromConfig) {
        log(
          `⚠️ Custom browser path from config.txt not found: "${customPathFromConfig}". Finding standard browser... (配置文件中的自定义浏览器路径未找到，正在查找标准浏览器...)`
        );
      }
      executablePath = findChrome();
      log(
        `✅ Found standard Chrome/Edge at: ${executablePath} (✅ 找到浏览器路径: ${executablePath})`
      );
    }
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath,
    });
  } catch (error) {
    log(
      `❌ Error launching browser: ${error.message} (❌ 启动浏览器时出错: ${error.message})`
    );
    return;
  }

  const page = await browser.newPage();
  const masterMediaUrls = new Set();

  if (config.DETAILED_LOGGING) {
    log("--- Attaching Network Listeners for Debugging ---");
    page.on("request", (request) =>
      log(`[REQ] ${request.method()} ${request.url()}`)
    );
    page.on("response", (response) => {
      const status = response.status();
      if (status >= 300) log(`[RES] ${status} ${response.url()}`);
    });
    page.on("requestfailed", (request) =>
      log(`[FAIL] ${request.url()} | ${request.failure()?.errorText}`)
    );
  }

  page.on("request", (req) => {
    const url = req.url();
    if (imageRegex.test(url) || videoRegex.test(url)) masterMediaUrls.add(url);
  });

  try {
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
    );
    await page.setViewport({ width: 1920, height: 1080 });

    log(`Navigating to ${targetUrl}... (正在导航至 ${targetUrl}...)`);
    await page.goto(targetUrl, { waitUntil: "load", timeout: 120000 }); // Increased timeout to 2 mins for slow networks

    log(
      "Page loaded. Waiting a few seconds for dynamic content... (页面已加载。等待几秒钟以加载动态内容...)"
    );
    await new Promise((res) => setTimeout(res, 5000));

    log(
      "📜 Scrolling page to find all media... (📜 正在滚动页面以查找所有媒体...)"
    );
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 400;
        const scrollMax = document.body.scrollHeight;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollMax) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });

    log(
      "🖼️ Evaluating page and collecting all media sources... (🖼️ 正在分析页面并收集所有媒体源...)"
    );
    const domMediaUrls = await page.evaluate((pageUrl) => {
      const urls = new Set();
      const toAbsoluteURL = (url) => {
        if (url?.startsWith("data:")) return url;
        try {
          return new URL(url, pageUrl).href;
        } catch (e) {
          return null;
        }
      };
      document.querySelectorAll("img, source, video").forEach((el) => {
        if (el.src) urls.add(el.src);
        if (el.dataset.src) urls.add(el.dataset.src);
        if (el.srcset) {
          el.srcset.split(",").forEach((part) => {
            const url = part.trim().split(" ")[0];
            if (url) urls.add(url);
          });
        }
      });
      document.querySelectorAll("*").forEach((el) => {
        const bg = window
          .getComputedStyle(el)
          .getPropertyValue("background-image");
        if (bg && bg !== "none") {
          const match = bg.match(/url\("?(.+?)"?\)/);
          if (match && match[1]) urls.add(match[1]);
        }
      });
      return Array.from(urls).map(toAbsoluteURL).filter(Boolean);
    }, targetUrl);

    domMediaUrls.forEach((url) => masterMediaUrls.add(url));

    const allUrls = Array.from(masterMediaUrls);
    const imageUrls = allUrls.filter(
      (url) =>
        imageRegex.test(url.split("?")[0]) || url.startsWith("data:image")
    );
    const videoUrls = allUrls.filter(
      (url) =>
        videoRegex.test(url.split("?")[0]) || url.startsWith("data:video")
    );

    log(
      `📸 Found ${imageUrls.length} image(s) and ${videoUrls.length} video(s). (📸 找到 ${imageUrls.length} 张图片和 ${videoUrls.length} 个视频。)`
    );

    if (imageUrls.length === 0 && videoUrls.length === 0) {
      log(
        "No media found to download. Exiting. (未找到可下载的媒体。正在退出。)"
      );
      if (browser) await browser.close();
      return;
    }

    const websiteName = new URL(targetUrl).hostname.replace(
      /[^a-zA-Z0-9\.\-]/g,
      "_"
    );
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const mainFolderName = `media-${websiteName}-${timestamp}`;

    const imageDir = path.join(process.cwd(), mainFolderName, "images");
    const videoDir = path.join(process.cwd(), mainFolderName, "videos");
    if (imageUrls.length > 0) fs.mkdirSync(imageDir, { recursive: true });
    if (videoUrls.length > 0) fs.mkdirSync(videoDir, { recursive: true });

    log(`\n⬇️  Starting download process into folder: ${mainFolderName}`);
    let downloadCount = 0;
    let failedCount = 0;

    async function downloadCategory(urls, categoryDir, categoryName) {
      if (urls.length === 0) return;
      log(`\n--- Downloading ${categoryName} (${urls.length} files) ---`);
      for (const url of urls) {
        try {
          let filename;
          if (url.startsWith("data:")) {
            filename = `data_${categoryName}_${Date.now()}`;
          } else {
            filename =
              path.basename(new URL(url).pathname) || `${categoryName}_file`;
          }
          const safeFilename = filename
            .replace(/[^\w\.\-]/g, "_")
            .substring(0, 100);
          let filepath = path.join(categoryDir, safeFilename);
          let counter = 1;
          while (fs.existsSync(filepath)) {
            const ext = path.extname(safeFilename);
            const nameWithoutExt = path.basename(safeFilename, ext);
            filepath = path.join(
              categoryDir,
              `${nameWithoutExt}-${counter}${ext || ""}`
            );
            counter++;
          }
          await downloadMedia(url, filepath, targetUrl);
          downloadCount++;
        } catch (err) {
          log(
            `\n❌ Failed to download ${url.substring(0, 60)}...: ${err.message}`
          );
          failedCount++;
        }
      }
    }

    await downloadCategory(imageUrls, imageDir, "Images");
    await downloadCategory(videoUrls, videoDir, "Videos");

    log(`\n\n✅ Downloaded ${downloadCount} files in total.`);
    if (failedCount > 0) log(`❌ Failed to download ${failedCount} files.`);
    log(`✅ Files saved in folder: ${mainFolderName}`);
  } catch (error) {
    log(
      `\n❌ An error occurred during scraping: ${error.message} (❌ 抓取过程中发生错误: ${error.message})`
    );
  } finally {
    if (browser) await browser.close();
    if (logStream) logStream.end();
  }
}

run()
  .then(() => {
    exitAfterDelay(5);
  })
  .catch((err) => {
    // Make sure this fatal log are also written to file if it's exists
    const config = loadConfig(); // Load again for Logstream Access
    let logStream;
    if (config.DETAILED_LOGGING) {
      const logFilename = `log-${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}.txt`;
      logStream = fs.createWriteStream(logFilename, { flags: "a" });
    }
    const fatalMessage = `\n[FATAL] An unhandled exception occurred: ${err.message}`;
    console.log(fatalMessage);
    if (logStream) logStream.write(fatalMessage);
    process.exit(1);
  });
