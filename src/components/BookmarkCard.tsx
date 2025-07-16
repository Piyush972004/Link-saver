
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, ExternalLink, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { format } from 'date-fns';

interface Bookmark {
  id: string;
  original_url: string;
  title: string;
  favicon_url: string | null;
  summary_text: string | null;
  tags: string[];
  created_at: string;
}

interface BookmarkCardProps {
  bookmark: Bookmark;
}

const BookmarkCard = ({ bookmark }: BookmarkCardProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showFullSummary, setShowFullSummary] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: bookmark.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmark.id);

      if (error) throw error;

      toast({
        title: "Bookmark deleted",
        description: "The bookmark has been removed.",
      });

      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    } catch (error: any) {
      toast({
        title: "Error deleting bookmark",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleOpenLink = () => {
    window.open(bookmark.original_url, '_blank', 'noopener,noreferrer');
  };

  // Format the date nicely
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch {
      return new Date(dateString).toLocaleDateString();
    }
  };

  // Check if summary is long and should be truncated
  const shouldTruncate = bookmark.summary_text && bookmark.summary_text.length > 120;
  const displaySummary = shouldTruncate && !showFullSummary 
    ? bookmark.summary_text!.substring(0, 120) + '...'
    : bookmark.summary_text;

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className="group hover:shadow-lg transition-shadow duration-200"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              {bookmark.favicon_url ? (
                <img 
                  src={bookmark.favicon_url} 
                  alt="Site icon" 
                  className="w-6 h-6"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-6 h-6 bg-muted rounded flex items-center justify-center text-xs">🔗</div>
              )}
            </div>
            <h3 className="font-semibold text-sm line-clamp-2 flex-1">
              {bookmark.title}
            </h3>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenLink}
              className="h-8 w-8 p-0"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground line-clamp-1">
            {new URL(bookmark.original_url).hostname}
          </p>
          
          {bookmark.summary_text && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {displaySummary}
              </p>
              {shouldTruncate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullSummary(!showFullSummary)}
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  {showFullSummary ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Show More
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
          
          {bookmark.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {bookmark.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {bookmark.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{bookmark.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">
            📅 Saved on {formatDate(bookmark.created_at)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookmarkCard;
