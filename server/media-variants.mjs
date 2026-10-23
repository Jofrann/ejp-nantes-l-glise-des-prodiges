import sharp from "sharp";
import { mkdir, stat, rename, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { tmpdir } from "node:os";
sharp.cache({ memory: 16, files: 0, items: 30 });
sharp.concurrency(1);
const widths = new Set([320, 640, 960, 1440, 1920]),
  root = join(tmpdir(), "ejp-public-images-v1"),
  pending = new Map();
let queue = Promise.resolve();
export async function publicImageVariant(path, id, width) {
  const w = Number(width);
  if (!widths.has(w)) return null;
  await mkdir(root, { recursive: true });
  const target = join(root, id + "-" + w + ".webp");
  try {
    await stat(target);
    return target;
  } catch {}
  if (pending.has(target)) return pending.get(target);
  const task = queue
    .catch(() => {})
    .then(async () => {
      const temp = join(root, id + "-" + w + "-" + randomUUID() + ".webp");
      try {
        await sharp(path, { limitInputPixels: 40000000 })
          .rotate()
          .resize({ width: w, withoutEnlargement: true })
          .webp({ quality: 78, effort: 4 })
          .toFile(temp);
        await rename(temp, target);
        return target;
      } finally {
        await unlink(temp).catch(() => {});
      }
    });
  queue = task;
  pending.set(target, task);
  try {
    return await task;
  } finally {
    pending.delete(target);
  }
}
