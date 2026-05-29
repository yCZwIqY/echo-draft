import CommentItem from '~/features/manuscript/document-content/comments/comment-item';

const Comments = () => {
  return (
    <div className={'flex flex-col gap-2 mt-4'}>
      <CommentItem />
      <CommentItem />
    </div>
  );
};

export default Comments;
