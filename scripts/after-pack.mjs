import path from 'node:path';

import { rcedit } from 'rcedit';

export default async function afterPack(context) {
  if (context.electronPlatformName !== 'win32') {
    return;
  }

  const executablePath = path.join(
    context.appOutDir,
    `${context.packager.appInfo.productFilename}.exe`,
  );
  const iconPath = path.join(context.packager.projectDir, 'assets', 'app-logo.ico');

  await rcedit(executablePath, {
    icon: iconPath,
  });
}
