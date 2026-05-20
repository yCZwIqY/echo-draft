import os from 'node:os';
import path from 'node:path';

export function getDefaultWorkspacePath() {
  return path.join(os.homedir(), 'Documents', 'draft-novel');
}
