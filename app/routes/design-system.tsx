import type { Route } from './+types/design-system';
import DnButton from '~/components/buttons/dn-button';
import DnInput from '~/components/inputs/dn-input';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ];
}

export default function DesignSystem() {
  return (
    <div className={'p-5 flex flex-col gap-2 flex-wrap'}>
      <div className={'flex gap-4'}>
        <DnButton size={'l'}>버튼</DnButton>
        <DnButton>버튼</DnButton>
        <DnButton size={'s'}>버튼</DnButton>
      </div>
      <div className={'flex gap-4'}>
        <DnButton>버튼</DnButton>
        <DnButton variant={'secondary'}>버튼</DnButton>
        <DnButton variant={'outlined'}>버튼</DnButton>
        <DnButton variant={'text'}>버튼</DnButton>
      </div>
      <div className={'flex gap-4'}>
        <DnInput size={'l'}/>
        <DnInput/>
        <DnInput size={'s'}/>
      </div>
      <div className={'flex gap-4'}>
        <DnInput variant={'outlined'}/>
        <DnInput variant={'underlined'}/>
        <DnInput variant={'text'}/>
      </div>
    </div>
  );
}
