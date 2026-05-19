import SideBar from '~/features/side-bar/side-bar';
import { Outlet } from 'react-router';

const MainLayout = () => {
  return (
    <div>
      <SideBar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
