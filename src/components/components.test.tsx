import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResultGrid } from './ResultGrid';
import { Markdown } from './Markdown';

describe('ResultGrid', () => {
  it('renders an error message when given an error', () => {
    render(<ResultGrid result={null} error="no such column: foo" />);
    expect(screen.getByText('no such column: foo')).toBeInTheDocument();
  });

  it('renders columns and rows', () => {
    render(<ResultGrid result={{ columns: ['name', 'salary'], rows: [['Alice', 145000]] }} />);
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('145000')).toBeInTheDocument();
  });

  it('shows NULL for null cells', () => {
    render(<ResultGrid result={{ columns: ['manager'], rows: [[null]] }} />);
    expect(screen.getByText('NULL')).toBeInTheDocument();
  });
});

describe('Markdown', () => {
  it('renders headings, code, and lists', () => {
    const source = ['## Title', '', 'Some `inline` text.', '', '- one', '- two'].join('\n');
    const { container } = render(<Markdown source={source} />);
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('inline')).toBeInTheDocument();
    expect(container.querySelectorAll('li')).toHaveLength(2);
  });

  it('renders fenced code blocks', () => {
    const source = ['```sql', 'SELECT 1;', '```'].join('\n');
    const { container } = render(<Markdown source={source} />);
    expect(container.querySelector('pre code')?.textContent).toBe('SELECT 1;');
  });
});
