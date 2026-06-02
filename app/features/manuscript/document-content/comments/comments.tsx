import CommentItem from '~/features/manuscript/document-content/comments/comment-item';
import GenerateComment from '~/features/manuscript/document-content/comments/generate-comment';
import { useState } from 'react';

interface Props {
  documentPath: string;
}
const Comments = ({ documentPath }: Props) => {
  const [comments, setComments] = useState<GeneratedComment[]>([]);
  return (
    <div>
      <GenerateComment
        documentPath={documentPath}
        onGenerated={(comments) => {
          setComments(comments)
        }}
      />
      <div className={'flex flex-col gap-2 mt-4'}>
        {comments?.map((comment: GeneratedComment) => (
          <CommentItem {...comment} />
        ))}
      </div>
    </div>
  );
};

export default Comments;
