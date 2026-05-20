import SideBar from '~/features/side-bar/side-bar';
import { Outlet } from 'react-router';

const MainLayout = () => {
  return (
    <div className={'flex'}>
      <SideBar />
      <main className={'flex-1'}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
