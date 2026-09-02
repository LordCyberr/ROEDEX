import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { GlobalSearchModal } from '../GlobalSearchModal';
import { useTrackerStore } from '../../../store/trackerStore';


vi.mock('../../../hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('GlobalSearchModal Component', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    useTrackerStore.setState({
      chestInventory: { 'Shield': 1, 'Stone': 50 },
      bankInventory: { 'Gold': 1000 },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('does not render when isOpen is false', () => {
    render(<GlobalSearchModal />);
    expect(screen.queryByPlaceholderText(/Search items/i)).not.toBeInTheDocument();
  });

  it('renders and allows typing', () => {
    render(<GlobalSearchModal />);
    // Since the actual component handles Ctrl+K to open, let's fire Ctrl+K to open it for testing.
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    
    const input = screen.getByPlaceholderText(/Search items/i);
    expect(input).toBeInTheDocument();
    
    fireEvent.change(input, { target: { value: 'sw' } });
    expect((input as HTMLInputElement).value).toBe('sw');
  });

  it('finds items across all inventories based on search query', () => {
    render(<GlobalSearchModal />);
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    const input = screen.getByPlaceholderText(/Search items/i);
    
    // Type 's' to match Shield, Stone (in chestInventory)
    fireEvent.change(input, { target: { value: 's' } });
    
    // They should appear in the results
    expect(screen.getByText('Shield')).toBeInTheDocument();
    expect(screen.getByText('Stone')).toBeInTheDocument();
    expect(screen.queryByText('Sword')).not.toBeInTheDocument(); // not in chest
  });
  
  it('closes when escape is pressed', () => {
    render(<GlobalSearchModal />);
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    
    expect(screen.getByPlaceholderText(/Search items/i)).toBeInTheDocument();
    
    // Simulate escape on window since listener is on window
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    
    // AnimatePresence makes element exit async, but since we mocked framer-motion it should be gone
    // wait for it to be removed
    expect(screen.queryByPlaceholderText(/Search items/i)).not.toBeInTheDocument();
  });
});
