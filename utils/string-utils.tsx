import { Fragment } from 'react';

export function renderMultilineContent(content?: string, key: string = 'content') {
  if (!content) {
    return '';
  }

  const lines = content.split('\n');
  return (
    <>
      {lines
        .map((line, i) => {
          return <Fragment key={`${key}-${i}`}>{line}</Fragment>;
        })
        .join('\n')}
      )
    </>
  );
}
