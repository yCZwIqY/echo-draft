import { formatDate } from '../../../../utils/date-utils';
import { useSelectedWorkspace } from '~/stores/use-selected-workspace';
import { AiOutlineFile, AiOutlineFolder } from 'react-icons/ai';
import { showToast } from '~/lib/toast-manager';
import ConfirmModalWrapper from '~/components/confirm-modal/confirm-modal-wrapper';
import { removeDocument, removeWorkspace as removeWorkspaceItem } from '~/lib/electron-api';

interface Props {
  tree: WorkspaceNode[];
}
const WorkspaceList = ({ tree }: Props) => {
  const setSelectedWorkspace = useSelectedWorkspace((state) => state.setSelectedWorkspace);

  const handleRemoveNode = async (item: WorkspaceNode) => {
    try {
      if (item.type === 'document') {
        await removeDocument(item.path);
        return;
      }

      await removeWorkspaceItem(item.path);
    } catch (error) {
      showToast((error as Error).message, 'danger');
    }
  };

  return (
    <section className='w-[100%] bg-white shadow-md rounded-lg cursor-default'>
      <table className={'w-full max-h-[320px] overflow-y-auto'}>
        <colgroup>
          <col className={'w-[52px]'} />
          <col className={'w-[30%]'} />
          <col className={'w-[20%]'} />
          <col className={'w-[10%]'} />
          <col className={'w-[10%]'} />
          <col className={'w-[10%]'} />
          <col className={'w-[52px]'} />
        </colgroup>
        <thead className={'border-b border-neutral-200'}>
          <tr className={'h-12  text-sm'}>
            <th>No.</th>
            <th>제목</th>
            <th>경로</th>

            <th>초안 글자수</th>
            <th>원고 글자수</th>
            <th>수정일</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {!tree ||
            (tree.length <= 0 && (
              <tr>
                <td
                  colSpan={7}
                  className={'p-4 text-sm text-neutral-500 text-center'}
                >
                  하위 항목이 존재하지 않습니다.
                </td>
              </tr>
            ))}
          {tree.map((item, index) => (
            <tr
              key={item.id ?? item.path}
              className={'border-b border-neutral-100 hover:bg-primary-100/10'}
            >
              <td className={'text-center p-2 font-bold text-neutral-500'}>
                {(index + 1).toLocaleString()}{' '}
              </td>
              <td>
                <div
                  className={
                    'w-full px-2 py-4 cursor-pointer hover:underline flex gap-2 items-center text-lg'
                  }
                  onClick={() => setSelectedWorkspace(item)}
                >
                  {item.type === 'document' ? (
                    <AiOutlineFile color={'var(--color-gray-400)'} />
                  ) : (
                    <AiOutlineFolder color={'var(--color-primary-500)'} />
                  )}
                  {item.name.split('.')[0]}
                </div>
              </td>
              <td className={'text-sm text-neutral-500'}>{item.path.split('.')[0]}</td>
              <td className={'text-center text-sm'}>
                {item.type === 'document' ? item.document?.draftLength?.toLocaleString() : '-'}
              </td>
              <td className={'text-center text-sm'}>
                {item.type === 'document' ? item.document?.manuscriptLength?.toLocaleString() : '-'}
              </td>
              <td className={'text-center text-sm'}>
                {formatDate(new Date(item.updatedAt ?? ''), 'YYYY-MM-DD HH:mm:SS')}
              </td>
              <td>
                <div className={'flex justify-center'}>
                  <ConfirmModalWrapper
                    confirmVariant={'red'}
                    description={
                      <div className={'py-10 text-center'}>
                        <span className={'font-bold text-primary-500'}>
                          {item.name.split('.')[0]}
                        </span>{' '}
                        {item.type === 'document' ? '문서를' : '워크스페이스를'} <br />
                        삭제하시겠습니까?
                        <br />
                        {item.type === 'workspace' && '하위 항목들도 함께 삭제됩니다'}
                        <br />
                        <br />
                        삭제된 항목은
                        <strong> Settings &gt; 휴지통</strong>
                        에서
                        <br /> 복원 할 수 있습니다.
                      </div>
                    }
                    onConfirm={() => void handleRemoveNode(item)}
                    confirmLabel={'삭제'}
                  >
                    <button
                      type={'button'}
                      className={'text-xs text-red-600 hover:underline'}
                    >
                      삭제
                    </button>
                  </ConfirmModalWrapper>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default WorkspaceList;
