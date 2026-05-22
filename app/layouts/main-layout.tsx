import SideBar from '~/features/side-bar/side-bar';
import { Outlet } from 'react-router';

const MainLayout = () => {
  return (
    <div className={'flex min-h-dvh bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.14),_transparent_34%),linear-gradient(180deg,_#fafaf9,_#f5f5f4)]'}>
      <SideBar />
      <main className={'flex-1 overflow-hidden'}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
