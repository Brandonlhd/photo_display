import { readdir, readFile } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import 'dotenv/config';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const RESOURCES = join(ROOT, 'Resources');

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic']);

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const Bucket = process.env.R2_BUCKET;

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

async function listExistingKeys() {
  const keys = new Set();
  let ContinuationToken;
  do {
    const res = await s3.send(new ListObjectsV2Command({ Bucket, ContinuationToken }));
    for (const obj of res.Contents || []) {
      keys.add(obj.Key);
    }
    ContinuationToken = res.NextContinuationToken;
  } while (ContinuationToken);
  return keys;
}

async function main() {
  const files = await walk(RESOURCES);
  const existing = await listExistingKeys();

  let uploaded = 0;
  let skipped = 0;

  for (const filePath of files) {
    const key = filePath.slice(RESOURCES.length + 1);
    if (existing.has(key)) {
      skipped++;
      continue;
    }

    const body = await readFile(filePath);
    const ext = extname(key).toLowerCase();
    const contentType = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.heic': 'image/heic',
    }[ext] || 'application/octet-stream';

    await s3.send(new PutObjectCommand({
      Bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }));

    uploaded++;
    console.log(`  ✓ ${key}`);
  }

  console.log(`\nDone: ${uploaded} uploaded, ${skipped} skipped (already exist)`);
}

main().catch(err => { console.error(err); process.exit(1); });
