
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';
import BookmarkCard from '../BookmarkCard';

// Mock the hooks and external dependencies
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: vi.fn() })
  };
});

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } }
}));

const mockBookmark = {
  id: '1',
  original_url: 'https://example.com',
  title: 'Test Bookmark',
  favicon_url: 'https://example.com/favicon.ico',
  summary_text: 'This is a test summary for the bookmark',
  tags: ['test', 'bookmark'],
  created_at: '2024-01-01T00:00:00Z'
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('BookmarkCard', () => {
  it('renders bookmark information correctly', () => {
    renderWithProviders(<BookmarkCard bookmark={mockBookmark} />);
    
    expect(screen.getByText('Test Bookmark')).toBeInTheDocument();
    expect(screen.getByText('example.com')).toBeInTheDocument();
    expect(screen.getByText('This is a test summary for the bookmark')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('bookmark')).toBeInTheDocument();
  });

  it('displays formatted date', () => {
    renderWithProviders(<BookmarkCard bookmark={mockBookmark} />);
    
    expect(screen.getByText(/📅 Saved on/)).toBeInTheDocument();
  });

  it('handles missing favicon gracefully', () => {
    const bookmarkWithoutFavicon = { ...mockBookmark, favicon_url: null };
    renderWithProviders(<BookmarkCard bookmark={bookmarkWithoutFavicon} />);
    
    // Should still render the bookmark without crashing
    expect(screen.getByText('Test Bookmark')).toBeInTheDocument();
  });
});
