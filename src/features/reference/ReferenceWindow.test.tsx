import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ReferenceWindow } from './ReferenceWindow';

describe('ReferenceWindow', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<ReferenceWindow open={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows the reference and switches the selected command', () => {
    render(<ReferenceWindow open onClose={() => {}} />);
    expect(screen.getByRole('dialog', { name: /sql command reference/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'WHERE' }));
    expect(screen.getByText(/Keeps only the rows that match/i)).toBeInTheDocument();
  });

  it('calls onClose from the close control', () => {
    const onClose = vi.fn();
    render(<ReferenceWindow open onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('has no obvious accessibility violations', async () => {
    const { container } = render(<ReferenceWindow open onClose={() => {}} />);
    const results = await axe(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(results).toHaveNoViolations();
  });
});
