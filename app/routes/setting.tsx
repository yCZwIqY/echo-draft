import TrashNode from '~/features/settings/trash-node/trash-node';
import AiSetting from '~/features/settings/ai-setting/ai-setting';
import CommentStyleExampleSetting from '~/features/settings/ai-setting/comment-style-example-setting';

const Setting = () => {
  return (
    <div className={'p-10 flex flex-col gap-3'}>
      <h3 className={'text-xl font-bold pb-4'}>설정</h3>
      <AiSetting />
      <CommentStyleExampleSetting />
      <TrashNode />
    </div>
  );
};

export default Setting;