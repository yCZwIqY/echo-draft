import { useModal } from '~/hooks/use-modal';
import type { ReactNode } from 'react';
import DnButton from '~/components/common/buttons/dn-button';
import type { Variants } from '~/components';

interface Props {
  children?: ReactNode;
  description?: ReactNode;
  onConfirm?: () => void;
  confirmVariant?: Variants | 'red' | 'red-outline';
  confirmLabel?: ReactNode;
}
const ConfirmModalWrapper = ({
  children,
  description,
  onConfirm,
  confirmVariant = 'primary',
  confirmLabel,
}: Props) => {
  const { portal, isOpen, setIsOpen } = useModal({
    content: (
      <div
        className={
          'w-[320px] rounded-[28px] bg-stone-50 p-8 text-stone-900 shadow-[0_30px_90px_rgba(15,23,42,0.22)] ring-1 ring-white/70 flex flex-col gap-2'
        }
      >
        <div className={'text-lg font-bold text-center'}>확인</div>
        <div className={'py-2'}>{description}</div>
        <div className={'flex flex-col gap-2 justify-center'}>
          <DnButton
            variant={confirmVariant}
            onClick={() => {
              onConfirm?.();
              setIsOpen(false);
            }}
          >
            {confirmLabel ?? '확인'}
          </DnButton>
          <DnButton
            variant={'outlined'}
            onClick={() => setIsOpen(false)}
          >
            닫기
          </DnButton>
        </div>
      </div>
    ),
  });
  return (
    <>
      <button
        className={'cursor-pointer'}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
      >
        {children}
      </button>
      {isOpen && portal}
    </>
  );
};

export default ConfirmModalWrapper;
