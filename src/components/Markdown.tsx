import { Fragment, type ReactNode } from 'react';

// A deliberately small markdown renderer that covers exactly what the theory
// content uses: h2/h3 headings, fenced code blocks, unordered lists, paragraphs,
// and inline `code`. Avoiding a full markdown dependency keeps the bundle small
// and the output predictable.

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i}>{part.slice(1, -1)}</code>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];

  let i = 0;
  let key = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1; // skip closing fence
      blocks.push(
        <pre key={key++}>
          <code>{code.join('\n')}</code>
        </pre>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      blocks.push(<h3 key={key++}>{renderInline(line.slice(4))}</h3>);
      i += 1;
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push(<h2 key={key++}>{renderInline(line.slice(3))}</h2>);
      i += 1;
      continue;
    }

    if (line.trim().startsWith('- ')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        items.push(lines[i].trim().slice(2));
        i += 1;
      }
      blocks.push(
        <ul key={key++}>
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (line.trim() === '') {
      i += 1;
      continue;
    }

    // Gather consecutive non-empty lines into a paragraph.
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('- ')
    ) {
      para.push(lines[i]);
      i += 1;
    }
    blocks.push(<p key={key++}>{renderInline(para.join(' '))}</p>);
  }

  return <div className="prose-theory">{blocks}</div>;
}
