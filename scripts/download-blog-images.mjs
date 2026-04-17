import { createWriteStream, mkdirSync, existsSync } from "fs";
import { pipeline } from "stream/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.resolve(__dirname, "..", "images");

if (!existsSync(IMAGES_DIR)) mkdirSync(IMAGES_DIR, { recursive: true });

const assets = [
  // Destacado — mentalidad / pan
  {
    url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80",
    dest: "blog-pan.jpg",
  },
  // Enchiladas potosinas
  {
    url: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1200&q=80",
    dest: "blog-enchiladas.jpg",
  },
  // Tortilla / tacos / maíz
  {
    url: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=1200&q=80",
    dest: "blog-tortilla.jpg",
  },
  // Running / Tangamanga
  {
    url: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=1200&q=80",
    dest: "blog-running.jpg",
  },
  // Mentalidad / estrés
  {
    url: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80",
    dest: "blog-mentalidad.jpg",
  },
  // Diabetes / clínica
  {
    url: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=1200&q=80",
    dest: "blog-diabetes.jpg",
  },
  // Despensa / mercado / temporada
  {
    url: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=1200&q=80",
    dest: "blog-despensa.jpg",
  },
];

async function download({ url, dest }) {
  const destPath = path.join(IMAGES_DIR, dest);
  if (existsSync(destPath)) {
    console.log("· skip (exists):", dest);
    return;
  }
  console.log("↓", url, "→", dest);
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status} for ${url}`);
  await pipeline(res.body, createWriteStream(destPath));
}

const CONCURRENCY = 4;
async function run() {
  const queue = [...assets];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const item = queue.shift();
      try { await download(item); }
      catch (err) { console.error("✗", item.dest, err.message); }
    }
  });
  await Promise.all(workers);
  console.log("Done.");
}

run();
