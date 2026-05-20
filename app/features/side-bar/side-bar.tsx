import { Link } from 'react-router';
import WorkspacePath from '~/features/workspace-path/workspace-path';
import { AiOutlinePlus } from 'react-icons/ai';

const SideBar = () => {
  return (
    <aside className={'w-[248px] h-dvh bg-gray-100 p-6 flex flex-col gap-3'}>
      <div>Draft Novel</div>
      <Link to={'/'}>홈</Link>
      <div>
        <WorkspacePath />
      </div>
      <div>
        <div className={'flex justify-between items-center cursor-default'}>
          <div>그룹</div>
          <button className={'bg-black rounded-sm p-1 cursor-pointer'}>
            <AiOutlinePlus color={'white'} />
          </button>
        </div>
        <div></div>
      </div>
    </aside>
  );
};

export default SideBar;
