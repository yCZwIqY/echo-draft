import { requireElectronApi } from '~/lib/electron/client';

export async function generateComments(payload: GenerateCommentsPayload) {
  return requireElectronApi().generateComments(payload);
}
