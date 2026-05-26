import type { Editor } from '@tiptap/core';
import {
  FaAlignCenter,
  FaAlignLeft,
  FaAlignRight,
  FaBold,
  FaItalic,
  FaListUl,
  FaRedoAlt,
  FaStrikethrough,
  FaUndoAlt,
} from 'react-icons/fa';

const DnEditorToolbar = ({ editor }: { editor: Editor | null }) => {
  const buttonClass = (active?: boolean) =>
    `cursor-pointer transition-colors ${active ? 'text-gray-800' : 'text-neutral-500 hover:text-gray-700'}`;

  return (
    <div className={'flex gap-4 items-center border-b border-neutral-200 p-2 text-lg [&>button]:p-2'}>
      <div className={'flex gap-4 items-center'}>
        <button
          type={'button'}
          className={buttonClass(false)}
          onClick={() => {
            editor?.chain().focus().undo().run();
          }}
        >
          <FaUndoAlt />
        </button>
        <button
          type={'button'}
          className={buttonClass(false)}
          onClick={() => {
            editor?.chain().focus().redo().run();
          }}
        >
          <FaRedoAlt />
        </button>
      </div>
      <div className={'w-px h-full border-r border-neutral-300'} />
      <button
        type={'button'}
        className={buttonClass(editor?.isActive('bold'))}
        onClick={() => {
          editor?.chain().focus().toggleBold().run();
        }}
      >
        <FaBold />
      </button>
      <button
        type={'button'}
        className={buttonClass(editor?.isActive('italic'))}
        onClick={() => {
          editor?.chain().focus().toggleItalic().run();
        }}
      >
        <FaItalic />
      </button>
      <button
        type={'button'}
        className={buttonClass(editor?.isActive('strike'))}
        onClick={() => {
          editor?.chain().focus().toggleStrike().run();
        }}
      >
        <FaStrikethrough />
      </button>
      <div className={'w-px h-full border-r border-neutral-300'} />
      <button
        type={'button'}
        className={buttonClass(editor?.isActive({ textAlign: 'left' }))}
        onClick={() => {
          editor?.chain().focus().setTextAlign('left').run();
        }}
      >
        <FaAlignLeft />
      </button>
      <button
        type={'button'}
        className={buttonClass(editor?.isActive({ textAlign: 'center' }))}
        onClick={() => {
          editor?.chain().focus().setTextAlign('center').run();
        }}
      >
        <FaAlignCenter />
      </button>
      <button
        type={'button'}
        className={buttonClass(editor?.isActive({ textAlign: 'right' }))}
        onClick={() => {
          editor?.chain().focus().setTextAlign('right').run();
        }}
      >
        <FaAlignRight />
      </button>
      <button
        type={'button'}
        className={buttonClass(editor?.isActive('bulletList'))}
        onClick={() => {
          editor?.chain().focus().toggleBulletList().run();
        }}
      >
        <FaListUl />
      </button>
    </div>
  );
};

export default DnEditorToolbar;
