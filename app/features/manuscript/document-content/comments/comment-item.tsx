const CommentItem = () => {
  return (
    <div className={'rounded-xl border border-stone-200 bg-white/90 p-8 shadow-sm flex gap-4'}>
      <div>
        <div className={'size-10 bg-gray-500 rounded-full'}></div>
      </div>
      <div className={'flex flex-col gap-2'}>
        <div className={'font-bold'}>nickname</div>
        <div>
          a<br />
          asd asd as das d
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
