import { useEffect, useState } from 'react';
import { getDocument } from '~/lib/electron-api';
import { useSelectedWorkspace } from '~/stores/use-selected-workspace';
import DocumentInfo from '~/features/manuscript/document-data/document-info';
import { WorkspaceBreadcrumb } from '~/features';
import { DocumentContent } from '~/features/manuscript/document-content';

export const DocumentData = () => {
  const selectedWorkspace = useSelectedWorkspace((state) => state.selectedWorkspace);
  const setSelectedWorkspace = useSelectedWorkspace((state) => state.setSelectedWorkspace);
  const [documentData, setDocumentData] = useState<WorkspaceNode | null>(null);

  useEffect(() => {
    if (!selectedWorkspace?.path || selectedWorkspace.type !== 'document') {
      setDocumentData(null);
      return;
    }

    let isMounted = true;

    void getDocument(selectedWorkspace.path).then((data) => {
      if (isMounted) {
        setDocumentData(data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedWorkspace?.id, selectedWorkspace?.path, selectedWorkspace?.type]);

  return (
    <div className={'flex flex-1 flex-col gap-4 p-8 w-full'}>
      <WorkspaceBreadcrumb />
      {documentData && (
        <div>
          <DocumentInfo
            workspaceData={documentData}
            onUpdated={(nextDocumentData) => {
              setDocumentData(nextDocumentData);
              setSelectedWorkspace(nextDocumentData);
            }}
          />
          <DocumentContent
            workspaceData={documentData}
            onUpdated={(nextDocumentData) => {
              setDocumentData(nextDocumentData);
              setSelectedWorkspace(nextDocumentData);
            }}
          />
        </div>
      )}
    </div>
  );
};
