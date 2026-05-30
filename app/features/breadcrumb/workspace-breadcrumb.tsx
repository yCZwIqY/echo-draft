import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import Breadcrumb, { type BreadcrumbItem } from './breadcrumb';
import { useSelectedWorkspace } from '~/stores/use-selected-workspace';
import { useWorkspacePath } from '~/hooks';
import { removeDocument } from '~/lib/electron/document-api';
import { getWorkspaceInfo, removeWorkspace as removeWorkspaceItem } from '~/lib/electron/workspace-api';
import ConfirmModalWrapper from '~/components/confirm-modal/confirm-modal-wrapper';
import { showToast } from '~/lib/toast-manager';

interface Props {
  className?: string;
  includeHome?: boolean;
}

function getBaseName(targetPath: string) {
  const normalizedPath = targetPath.replace(/[\\/]+$/, '');
  const segments = normalizedPath.split(/[\\/]/).filter(Boolean);

  return segments.at(-1) ?? targetPath;
}

function buildWorkspaceNode(targetPath: string): WorkspaceNode {
  return {
    type: 'workspace',
    path: targetPath,
    parentPath: targetPath.replace(/[\\/][^\\/]+$/, '') || targetPath,
    name: getBaseName(targetPath),
    workspace: {},
  };
}

function normalizePath(targetPath: string) {
  return targetPath.replace(/\\/g, '/').replace(/\/+$/, '');
}

const WorkspaceBreadcrumb = ({ className, includeHome = true }: Props) => {
  const navigate = useNavigate();
  const selectedWorkspace = useSelectedWorkspace((state) => state.selectedWorkspace);
  const setSelectedWorkspace = useSelectedWorkspace((state) => state.setSelectedWorkspace);
  const { workspacePath } = useWorkspacePath();

  const items = useMemo(() => {
    if (!selectedWorkspace?.path) {
      return includeHome ? [{ label: '홈', to: '/' }] : [];
    }

    const breadcrumbItems: BreadcrumbItem[] = [];

    if (includeHome) {
      breadcrumbItems.push({
        label: '홈',
        to: '/',
      });
    }

    const rootPath = normalizePath(workspacePath);
    const selectedPath = normalizePath(selectedWorkspace.path);
    const currentWorkspacePath =
      selectedWorkspace.type === 'workspace'
        ? selectedPath
        : normalizePath(
            selectedWorkspace.parentPath || selectedWorkspace.path.replace(/[\\/][^\\/]+$/, ''),
          );
    const relativePath = currentWorkspacePath.startsWith(rootPath)
      ? currentWorkspacePath.slice(rootPath.length).replace(/^\/+/, '')
      : '';
    const pathSegments = relativePath ? relativePath.split('/').filter(Boolean) : [];
    const ancestorSegments =
      selectedWorkspace.type === 'workspace' ? pathSegments.slice(0, -1) : pathSegments;
    const ancestors = ancestorSegments.map((_, index) => {
      const ancestorPath = [rootPath, ...ancestorSegments.slice(0, index + 1)].join('/');
      return buildWorkspaceNode(ancestorPath);
    });

    for (const ancestor of ancestors) {
      breadcrumbItems.push({
        label: ancestor.name,
        onClick: () => {
          void getWorkspaceInfo(ancestor.path).then((workspaceNode) => {
            setSelectedWorkspace(workspaceNode);
            navigate('/manuscript');
          });
        },
      });
    }

    breadcrumbItems.push({
      label: selectedWorkspace.document?.title || selectedWorkspace.name,
    });

    return breadcrumbItems;
  }, [includeHome, navigate, selectedWorkspace, setSelectedWorkspace, workspacePath]);

  const handleRemoveNode = async (item: WorkspaceNode) => {
    try {
      if (item.type === 'document') {
        await removeDocument(item.path);
        return;
      }

      await removeWorkspaceItem(item.path);
    } catch (error) {
      showToast((error as Error).message, 'danger');
    }
  };

  return (
    <div className={'flex justify-between items-center'}>
      <Breadcrumb
        className={className}
        items={items}
      />
      {selectedWorkspace && (
        <ConfirmModalWrapper
          confirmVariant={'red'}
          description={
            <div className={'py-10 text-center'}>
              <span className={'font-bold text-primary-500'}>
                {selectedWorkspace?.name.split('.')[0]}
              </span>{' '}
              {selectedWorkspace?.type === 'document' ? '문서를' : '워크스페이스를'} <br />
              삭제하시겠습니까?
              <br />
              {selectedWorkspace?.type === 'workspace' && '하위 항목들도 함께 삭제됩니다'}
              <br />
              <br />
              삭제된 항목은
              <strong> Settings &gt; 휴지통</strong>
              에서
              <br /> 복원 할 수 있습니다.
            </div>
          }
          onConfirm={async () => {
            if (!selectedWorkspace) return;

            await handleRemoveNode(selectedWorkspace);
            showToast(
              `${selectedWorkspace.name} ${selectedWorkspace?.type === 'document' ? '문서가' : '워크스페이스가'} 휴지통으로 이동했습니다.`,
            );
            navigate('/');
          }}
          confirmLabel={'삭제'}
        >
          <button
            type={'button'}
            className={'text-xs text-red-600 hover:underline cursor-pointer'}
          >
            삭제
          </button>
        </ConfirmModalWrapper>
      )}
    </div>
  );
};

export default WorkspaceBreadcrumb;
