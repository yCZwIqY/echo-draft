import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_IGNORE_FILES = ['workspace-info.json', 'workspace.json', 'documents', 'images'];

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
  const ignore = [...DEFAULT_IGNORE_FILES, ...(options.ignore ?? [])];

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
        type: 'workspace',
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
        type: 'document',
      });
    }
  }

  return nodes.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'workspace' ? -1 : 1;
    }

    return a.name.localeCompare(b.name);
  });
}

export async function copyFileToDirectory(sourcePath, targetDir) {
  await fs.mkdir(targetDir, { recursive: true });

  const fileName = path.basename(sourcePath);
  const targetPath = path.join(targetDir, `${crypto.randomUUID()}_${fileName}`);

  await fs.copyFile(sourcePath, targetPath);

  return targetPath;
}

export async function deleteFile(targetPath) {
  await fs.rm(targetPath, { recursive: true });
}
