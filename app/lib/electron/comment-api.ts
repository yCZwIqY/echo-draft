import { requireElectronApi } from '~/lib/electron/client';

export async function addCommentExample(payload: AddCommentExamplePayload) {
  return requireElectronApi().addCommentExample(payload);
}

export async function generateComments(payload: GenerateCommentsPayload) {
  return requireElectronApi().generateComments(payload);
}

export async function listCommentExamples() {
  return requireElectronApi().listCommentExamples();
}

export async function removeCommentExample(id: string) {
  return requireElectronApi().removeCommentExample(id);
}
