
const CommentItem = ({
  expertiseLabel,
  ageGroup,
  tone,
  content,
}: GeneratedComment) => {
  return (
    <div className={'rounded-xl border border-stone-200 bg-white/90 p-8 shadow-sm flex gap-4'}>
      <div>
        <div className={'size-10 bg-gray-500 rounded-full'}></div>
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
