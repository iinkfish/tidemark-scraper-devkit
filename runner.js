import { readdir, access } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRAPERS_DIR = resolve(__dirname, "scrapers");
const DEFAULT_SCHEDULE = "0 * * * *";
const DISCOVERY_SCHEDULE = "*/1 * * * *";
const SCRAPER_TIMEOUT_MS = 30000;
const DEFAULT_SCHEMA = "environmental-schema"

async function loadScrapers() {
  const entries = await readdir(SCRAPERS_DIR, { withFileTypes: true });

  const scrapers = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      scrapers.push({
        file: resolve(SCRAPERS_DIR, entry.name, "index.js"),
        dir: resolve(SCRAPERS_DIR, entry.name),
      });
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      scrapers.push({
        file: resolve(SCRAPERS_DIR, entry.name),
        dir: null,
      });
    }
  }
  return scrapers;
}

const scrapers = await loadScrapers();

for (const { file, dir } of scrapers) {
  try {

    const filePath = pathToFileURL(file).href;
    const module = await import(filePath);
    const name = module.config?.name ?? file;
    const schedule = module.config?.schedule ?? DEFAULT_SCHEDULE;
    const schema = module.config?.pointSchema ?? DEFAULT_SCHEMA;

    const result = await module.run();

    console.log(`Result of [${name}]:`, result);
  } catch (err) {
    console.error(`Failed to run [${file}]:`, err);
  }
}

// console.log(await loadScrapers());
