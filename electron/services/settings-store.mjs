import path from 'node:path';
import fs from 'node:fs/promises';

export function createSettingsStore(app) {
  function getSettingsPath() {
    return path.join(app.getPath('userData'), 'settings.json');
  }

  async function read() {
    try {
      const raw = await fs.readFile(getSettingsPath(), 'utf8');
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  async function write(settings) {
    const settingsPath = getSettingsPath();

    await fs.mkdir(path.dirname(settingsPath), {
      recursive: true,
    });

    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
  }

  async function updateSettings(settings) {
    const settingsPath = getSettingsPath();
    const raw = await fs.readFile(settingsPath, 'utf8');
    const prevData = JSON.parse(raw);

    await fs.writeFile(
      settingsPath,
      JSON.stringify({
        ...settings,
        prevData,
      }),
      'utf8',
    );
  }

  return {
    read,
    write,
    updateSettings
  };
}
