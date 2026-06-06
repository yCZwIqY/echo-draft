import type { Route } from './+types/design-system';
import DnButton from '~/components/common/buttons/dn-button';
import DnInput from '~/components/common/inputs/dn-input';

export function meta({}: Route.MetaArgs) {
  return [{ title: '그루미' }];
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
