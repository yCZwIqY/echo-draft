import { useState } from 'react';
import { updateDocument } from '~/lib/electron/document-api';

type DocumentTextStatus = {
  charsWithSpaces: number;
  charsWithoutSpaces: number;
};

export const useDocumentContent = () => {
  const [draft, setDraft] = useState('');
  const [manuscript, setManuscript] = useState('');
  const [draftStatus, setDraftStatus] = useState<DocumentTextStatus>({
    charsWithSpaces: 0,
    charsWithoutSpaces: 0,
  });
  const [manuscriptStatus, setManuscriptStatus] = useState<DocumentTextStatus>({
    charsWithSpaces: 0,
    charsWithoutSpaces: 0,
  });

  const resetContent = (workspaceData?: WorkspaceNode) => {
    if (workspaceData) {
      setDraft(workspaceData.document?.draft?.content ?? '');
      setDraftStatus({
        charsWithSpaces: workspaceData.document?.draft?.charsWithSpaces ?? 0,
        charsWithoutSpaces: workspaceData.document?.draft?.charsWithoutSpaces ?? 0,
      });
      setManuscript(workspaceData?.document?.manuscript?.content ?? '');
      setManuscriptStatus({
        charsWithSpaces: workspaceData.document?.manuscript?.charsWithSpaces ?? 0,
        charsWithoutSpaces: workspaceData.document?.manuscript?.charsWithoutSpaces ?? 0,
      });
    } else {
      setDraft('');
      setManuscript('');
      setDraftStatus({
        charsWithSpaces: 0,
        charsWithoutSpaces: 0,
      });
      setManuscriptStatus({
        charsWithSpaces: 0,
        charsWithoutSpaces: 0,
      });
    }
  };

  const handleUpdate = async (workspaceData?: WorkspaceNode): Promise<WorkspaceNode | null> => {
    if (!workspaceData?.path) {
      return null;
    }

    return await updateDocument(workspaceData?.path, {
      ...workspaceData,
      document: {
        ...workspaceData.document,
        draft: {
          ...workspaceData.document?.draft,
          content: draft,
          charsWithSpaces: draftStatus.charsWithSpaces,
          charsWithoutSpaces: draftStatus.charsWithoutSpaces,
          updatedAt: new Date().toISOString(),
          createdAt: workspaceData.document?.draft?.createdAt ?? '',
        },
        manuscript: {
          ...workspaceData.document?.manuscript,
          content: manuscript,
          charsWithSpaces: manuscriptStatus.charsWithSpaces,
          charsWithoutSpaces: manuscriptStatus.charsWithoutSpaces,
          updatedAt: new Date().toISOString(),
          createdAt: workspaceData.document?.manuscript?.createdAt ?? '',
        },
      },
    });
  };

  return {
    draft,
    setDraft,
    manuscript,
    setManuscript,
    draftStatus,
    setDraftStatus,
    manuscriptStatus,
    setManuscriptStatus,
    resetContent,
    handleUpdate,
  };
};
