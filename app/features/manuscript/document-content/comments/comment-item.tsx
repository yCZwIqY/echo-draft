import { FaUser } from 'react-icons/fa';

const CommentItem = ({
  expertiseLabel,
  ageGroup,
  tone,
  content,
}: GeneratedComment) => {
  return (
    <div className={'border-b border-stone-300 py-5 flex gap-4 items-center'}>
      <div>
        <div className={'size-10 bg-gray-400 rounded-full flex items-center justify-center overflow-hidden'}>
          <FaUser size={32} className={'mt-2'} color={'white'}/>
        </div>
      </div>
      <div className={'flex flex-col gap-2'}>
        <div className={'font-bold text-sm'}>
          {expertiseLabel} | {ageGroup}대 | {tone}
        </div>
        <div className={'whitespace-pre-line'}>{content}</div>
      </div>
    </div>
  );
};

export default CommentItem;
