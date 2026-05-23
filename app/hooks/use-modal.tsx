import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { usePortal } from 'jy-headless';

interface Props {
  content: ReactNode;
}

export const useModal = ({ content }: Props, dependencies: unknown[] = []) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      return;
    }

    const timeout = window.setTimeout(() => {
      setIsRendered(false);
    }, 220);

    return () => window.clearTimeout(timeout);
  }, [isOpen]);

  const modalContent = useMemo(
    () => (
      <div
        className={`modal-overlay absolute inset-0 flex justify-center items-center px-4 ${isOpen ? 'modal-overlay--open' : 'modal-overlay--closed'}`}
      >
        <div
          ref={contentRef}
          className={`modal-surface ${isOpen ? 'modal-surface--open' : 'modal-surface--closed'}`}
        >
          {content}
        </div>
      </div>
    ),
    [content, isOpen, ...dependencies],
  );

  const { portal } = usePortal({
    content: modalContent,
    visible: isRendered,
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
