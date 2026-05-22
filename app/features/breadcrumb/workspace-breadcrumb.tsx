import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import Breadcrumb, { type BreadcrumbItem } from './breadcrumb';
import { useSelectedWorkspace } from '~/stores/use-selected-workspace';
import { useWorkspacePath } from '~/hooks';

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
        : normalizePath(selectedWorkspace.parentPath || selectedWorkspace.path.replace(/[\\/][^\\/]+$/, ''));
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
          setSelectedWorkspace(ancestor);
          navigate('/manuscript');
        },
      });
    }

    breadcrumbItems.push({
      label: selectedWorkspace.title || selectedWorkspace.name,
    });

    return breadcrumbItems;
  }, [includeHome, navigate, selectedWorkspace, setSelectedWorkspace, workspacePath]);

  return (
    <Breadcrumb
      className={className}
      items={items}
    />
  );
};

export default WorkspaceBreadcrumb;
