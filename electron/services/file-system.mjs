import fs from 'node:fs/promises';
import path from 'node:path';

export async function ensureDirectory(dirPath) {
  await fs.mkdir(dirPath, {
    recursive: true,
  });
}

export async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function readTextFile(filePath) {
  return fs.readFile(filePath, 'utf8');
}

export async function readDirectoryTree(dirPath, options = {}) {
  const maxDepth = options.maxDepth ?? 5;
  const currentDepth = options.currentDepth ?? 0;
  const ignore = options.ignore ?? [];

  if (currentDepth >= maxDepth) {
    return [];
  }

  const entries = await fs.readdir(dirPath, {
    withFileTypes: true,
  });

  const nodes = [];

  for (const entry of entries) {
    if (ignore.includes(entry.name)) {
      continue;
    }

    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      nodes.push({
        name: entry.name,
        path: fullPath,
        type: 'directory',
        children: await readDirectoryTree(fullPath, {
          maxDepth,
          currentDepth: currentDepth + 1,
          ignore,
        }),
      });
      continue;
    }

    if (entry.isFile()) {
      nodes.push({
        name: entry.name,
        path: fullPath,
        type: 'file',
      });
    }
  }

  return nodes.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'directory' ? -1 : 1;
    }

    return a.name.localeCompare(b.name);
  });
}
