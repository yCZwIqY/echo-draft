import path from 'node:path';
import fs from 'node:fs/promises';
import type { App } from 'electron';

export type SettingsData = {
  workspacePath?: string;
  recentVisits?: Array<{
    id?: string;
    path?: string;
    [key: string]: unknown;
  }>;
};

export function createSettingsStore(app: Pick<App, 'getPath'>) {
  function getSettingsPath() {
    return path.join(app.getPath('userData'), 'settings.json');
  }

  async function read(): Promise<SettingsData> {
    try {
      const raw = await fs.readFile(getSettingsPath(), 'utf8');
      return JSON.parse(raw) as SettingsData;
    } catch {
      return {};
    }
  }

  async function write(settings: SettingsData) {
    const settingsPath = getSettingsPath();

    await fs.mkdir(path.dirname(settingsPath), {
      recursive: true,
    });

    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
  }

  async function updateSettings(settings: SettingsData) {
    const settingsPath = getSettingsPath();
    const raw = await fs.readFile(settingsPath, 'utf8');
    const prevData = JSON.parse(raw) as SettingsData;

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
