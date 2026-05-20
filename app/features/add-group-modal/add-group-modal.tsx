import { useWorkspacePath } from '~/hooks';
import { useDebounce } from 'jy-headless';

interface Props {
  targetPath?: string;
}
const AddGroupModal = ({ targetPath }: Props) => {
  const { workspacePath } = useWorkspacePath();
  // const {} = useDebounce()
  return <div></div>;
};

export default AddGroupModal;
