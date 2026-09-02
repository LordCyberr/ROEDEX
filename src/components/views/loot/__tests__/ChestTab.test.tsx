import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ChestTab } from '../ChestTab';
import { useTrackerStore } from '../../../../store/trackerStore';

vi.mock('../../../../hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, 'data-testid': testId, className, onClick }: any) => <div data-testid={testId} className={className} onClick={onClick}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('ChestTab Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTrackerStore.setState({
      chestInventory: {},
      marketListings: {},
      marketSales: [],
      marketEthUsd: 2000
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('shows empty state message when inventory is empty', () => {
    render(<ChestTab isHorizontal={false} compactHeightClass="" />);
    expect(screen.getByText('stats.inventoryEmpty')).toBeInTheDocument();
  });

  it('renders items when inventory is populated', () => {
    useTrackerStore.setState({
      chestInventory: {
        'iron_ore': 10,
        'oak_log': 5
      }
    });

    render(<ChestTab isHorizontal={false} compactHeightClass="" />);
    expect(screen.getByText(/iron ore/i)).toBeInTheDocument();
    expect(screen.getByText(/oak_log/i)).toBeInTheDocument();
  });
});
