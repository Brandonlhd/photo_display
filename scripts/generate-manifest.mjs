import { readdir, mkdir, writeFile } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const RESOURCES = join(ROOT, 'Resources');
const OUTPUT = join(ROOT, 'src', 'data', 'photos.json');

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic']);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === '.DS_Store') continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
    } else if (entry.isFile() && IMAGE_EXTS.has(extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }
  return files;
}

function parseFolderName(name) {
  const match = name.match(/^(\d{4})(\d{2})(\d{2})\s+(.+)$/);
  if (match) {
    return { date: `${match[1]}-${match[2]}-${match[3]}`, title: match[4] };
  }
  return { date: '', title: name };
}

async function main() {
  const files = await walk(RESOURCES);
  const photos = [];
  let id = 1;

  for (const filePath of files) {
    const relative = filePath.slice(RESOURCES.length + 1);
    const folderName = relative.split('/')[0];
    const fileName = relative.split('/').pop();
    const { date, title: albumTitle } = parseFolderName(folderName);

    photos.push({
      id: id++,
      filename: fileName,
      category: folderName,
      albumTitle,
      date,
      src: `/photos/${encodeURIComponent(folderName)}/${encodeURIComponent(fileName)}`,
    });
  }

  await mkdir(join(ROOT, 'src', 'data'), { recursive: true });
  await writeFile(OUTPUT, JSON.stringify(photos, null, 2), 'utf-8');
  console.log(`Generated manifest with ${photos.length} photos`);
}

main().catch(err => { console.error(err); process.exit(1); });
