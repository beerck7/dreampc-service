import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createServer } from "../scripts/serve.mjs";
import { getBrowser } from "../scripts/browser.mjs";
const root = fileURLToPath(new URL("..", import.meta.url));
const out = path.join(root, "exports");
await mkdir(out, { recursive: true });
const server = await createServer(0);
let browser;
try {
  browser = await getBrowser();
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1800 },
    deviceScaleFactor: 1,
  });
  await page.goto(
    `http://127.0.0.1:${server.address().port}/tools/materials.html`,
    { waitUntil: "networkidle" },
  );
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.body.classList.add("export-mode"));
  const assets = {
    socialService: "instagram-service.png",
    socialProcess: "instagram-process.png",
    socialBuild: "instagram-build.png",
    avatar: "avatar.png",
    highlightService: "highlight-service.png",
    highlightBuild: "highlight-build.png",
    highlightPricing: "highlight-pricing.png",
    highlightFaq: "highlight-faq.png",
    cardFront: "business-card-front.png",
    cardBack: "business-card-back.png",
  };
  for (const [id, name] of Object.entries(assets)) {
    const width = id.startsWith("card") ? 850 : 1080;
    const height = id.startsWith("card")
      ? 550
      : id.startsWith("social")
        ? 1350
        : 1080;
    const element = page.locator("#" + id);
    await element.evaluate((el) => {
      el.style.position = "fixed";
      el.style.left = "0";
      el.style.top = "0";
      el.style.zIndex = "100";
    });
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({
      path: path.join(out, name),
      clip: { x: 0, y: 0, width, height },
    });
    await element.evaluate((el) => el.removeAttribute("style"));
  }
  await page.evaluate(() => document.body.classList.remove("export-mode"));
  await page.pdf({
    path: path.join(out, "business-cards.pdf"),
    preferCSSPageSize: true,
    printBackground: true,
  });
  console.log("Zapisano 10 grafik PNG i business-cards.pdf w exports/");
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
