import { useEffect, useState } from 'react';
import { formatDate } from '../../../../utils/date-utils';
import { FaCamera } from 'react-icons/fa';
import { AiOutlineCalendar } from 'react-icons/ai';
import { readImage, removeFile, saveImage, updateWorkspaceInfo } from '~/lib/electron-api';

interface Props {
  workspaceData?: WorkspaceNode | null;
  onUpdated?: (workspaceData: WorkspaceNode) => void;
}
const WorkflowSummary = ({ workspaceData, onUpdated }: Props) => {
  const [coverSrc, setCoverSrc] = useState('');

  useEffect(() => {
    let isMounted = true;

    if (!workspaceData?.coverPath) {
      setCoverSrc('');
      return () => {
        isMounted = false;
      };
    }

    void readImage(workspaceData.coverPath).then((src) => {
      if (isMounted) {
        setCoverSrc(src);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [workspaceData?.coverPath]);

  const handleSaveCoverImage = async (files: FileList | null) => {
    if (!files || !files.length || !workspaceData?.path) {
      return;
    }
    const file = files[0];
    const newCoverPath = await saveImage(workspaceData.path, file);
    const prevCoverPath = workspaceData?.coverPath;
    if (prevCoverPath) {
      await removeFile(prevCoverPath);
    }
    const updatedWorkspace = await updateWorkspaceInfo(workspaceData?.path, { coverPath: newCoverPath });
    onUpdated?.(updatedWorkspace);
  };



  return (
    <section className={'shadow-sm p-5 w-full bg-white rounded-lg flex gap-4'}>
      <div className={'w-[180px] h-[220px] shrink-0'}>
        <label
          className={
            'group relative flex h-full w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg bg-stone-200'
          }
        >
          {coverSrc ? (
            <>
              <img
                className={'h-full w-full object-cover'}
                src={coverSrc}
                alt={`${workspaceData?.name ?? '워크스페이스'}의 커버 이미지`}
                width={200}
                height={300}
              />
              <div className={'absolute inset-0 flex items-center justify-center bg-stone-950/0 text-white opacity-0 transition-all group-hover:bg-stone-950/45 group-hover:opacity-100'}>
                커버 이미지 교체
              </div>
            </>
          ) : (
            <>
            <FaCamera color={'#737373'} />
            <div className={'text-neutral-500'}>커버 이미지 교체</div>
            </>
          )}
          <input
            className={'sr-only'}
            multiple={false}
            type={'file'}
            accept={'image/*'}
            onChange={(e) => {
              void handleSaveCoverImage(e.target.files);
            }}
          />
        </label>
      </div>
      <div>
        <h3 className={'text-2xl font-bold text-neutral-700'}>{workspaceData?.name}</h3>
        <div className={'flex gap-1 items-center text-sm text-neutral-400'}>
          <AiOutlineCalendar />{' '}
          {formatDate(new Date(workspaceData?.createdAt ?? ''), 'YYYY-MM-DD HH:mm:SS')}
        </div>
      </div>
    </section>
  );
};

export default WorkflowSummary;
