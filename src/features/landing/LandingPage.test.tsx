import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'vitest-axe';
import { LandingPage } from './LandingPage';
import { SettingsProvider } from '../../app/SettingsProvider';

function renderLanding() {
  return render(
    <SettingsProvider>
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    </SettingsProvider>
  );
}

describe('LandingPage', () => {
  it('shows the brand and a call to action', () => {
    renderLanding();
    expect(screen.getByRole('heading', { name: /data becomes decisions/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Mizan/i).length).toBeGreaterThan(0);
  });

  it('lists the SQL course and marks others as coming soon', () => {
    renderLanding();
    expect(screen.getAllByText('SQL').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Coming soon/i).length).toBeGreaterThan(0);
  });

  it('has no obvious accessibility violations', async () => {
    const { container } = renderLanding();
    const results = await axe(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(results).toHaveNoViolations();
  });
});
