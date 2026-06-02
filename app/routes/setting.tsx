import TrashNode from '~/features/settings/trash-node/trash-node';
import AiSetting from '~/features/settings/ai-setting/ai-setting';

const Setting = () => {
  return (
    <div className={'p-10'}>
      <AiSetting />
      <TrashNode />
    </div>
  );
};

export default Setting;