import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { usePortal } from 'jy-headless';

interface Props {
  content: ReactNode;
}

export const useModal = ({ content }: Props, dependencies: unknown[] = []) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const modalContent = useMemo(
    () => (
      <div className={'absolute inset-0 bg-black/30 flex justify-center items-center'}>
        <div ref={contentRef}>{content}</div>
      </div>
    ),
    [content, ...dependencies],
  );

  const { portal } = usePortal({
    content: modalContent,
    visible: isOpen,
    rootId: 'root',
  });

  useEffect(() => {
    if (contentRef.current) {
      const clickOutSide = (e: MouseEvent) => {
        const target = e.target as Node;
        if (!contentRef.current?.contains(target)) {
          setIsOpen(false);
        }
      };
      window.addEventListener('mouseup', clickOutSide);

      return () => window.removeEventListener('mouseup', clickOutSide);
    }
  }, [contentRef, isOpen]);

  return {
    isOpen,
    setIsOpen,
    portal,
  };
};
