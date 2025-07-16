
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import BookmarkCard from './BookmarkCard';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState, useEffect } from 'react';

interface Bookmark {
  id: string;
  original_url: string;
  title: string;
  favicon_url: string | null;
  summary_text: string | null;
  tags: string[];
  position: number;
  created_at: string;
}

interface BookmarkGridProps {
  searchQuery: string;
  selectedTags: string[];
}

const BookmarkGrid = ({ searchQuery, selectedTags }: BookmarkGridProps) => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ['bookmarks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true });

      if (error) throw error;
      return data as Bookmark[];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (data) {
      setBookmarks(data);
    }
  }, [data]);

  const filteredBookmarks = bookmarks.filter((bookmark) => {
    const matchesSearch = !searchQuery || 
      bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.summary_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.original_url.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => bookmark.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = bookmarks.findIndex((item) => item.id === active.id);
      const newIndex = bookmarks.findIndex((item) => item.id === over.id);

      const newBookmarks = arrayMove(bookmarks, oldIndex, newIndex);
      setBookmarks(newBookmarks);

      // Update positions in database
      try {
        const updates = newBookmarks.map((bookmark, index) => ({
          id: bookmark.id,
          position: index
        }));

        for (const update of updates) {
          await supabase
            .from('bookmarks')
            .update({ position: update.position })
            .eq('id', update.id);
        }
      } catch (error) {
        console.error('Error updating bookmark positions:', error);
        // Revert on error
        setBookmarks(bookmarks);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error loading bookmarks. Please try again.</p>
      </div>
    );
  }

  if (filteredBookmarks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          {searchQuery || selectedTags.length > 0 
            ? 'No bookmarks match your search criteria.' 
            : 'No bookmarks yet. Add your first link above!'}
        </p>
      </div>
    );
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={filteredBookmarks.map(b => b.id)} strategy={verticalListSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookmarks.map((bookmark) => (
            <BookmarkCard key={bookmark.id} bookmark={bookmark} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default BookmarkGrid;
