import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textAlign: {
      setTextAlign: (alignment: 'left' | 'center' | 'right') => ReturnType;
    };
  }
}

const TextAlign = Extension.create({
  name: 'textAlign',

  addOptions() {
    return {
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right'],
      defaultAlignment: 'left',
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textAlign: {
            default: this.options.defaultAlignment,
            parseHTML: (element: HTMLElement) =>
              this.options.alignments.includes(element.style.textAlign)
                ? element.style.textAlign
                : this.options.defaultAlignment,
            renderHTML: (attributes: { textAlign?: string }) => ({
              style: `text-align: ${attributes.textAlign ?? this.options.defaultAlignment}`,
            }),
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setTextAlign:
        (alignment: 'left' | 'center' | 'right') =>
        ({ chain }) => {
          if (!this.options.alignments.includes(alignment)) {
            return false;
          }

          const commands = chain();

          for (const type of this.options.types as string[]) {
            commands.updateAttributes(type, { textAlign: alignment });
          }

          return commands.run();
        },
    };
  },
});

export default TextAlign;
