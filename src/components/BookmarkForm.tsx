
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { X, Tag } from 'lucide-react';

interface BookmarkFormProps {
  onSuccess: () => void;
}

const BookmarkForm = ({ onSuccess }: BookmarkFormProps) => {
  const [url, setUrl] = useState('');
  const [customTags, setCustomTags] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addTag = () => {
    if (customTags.trim() && !tags.includes(customTags.trim())) {
      setTags([...tags, customTags.trim()]);
      setCustomTags('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const fetchMetadata = async (url: string) => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      
      // Check if it's a blocked domain
      const blockedDomains = ['linkedin.com', 'instagram.com', 'facebook.com', 'twitter.com', 'x.com'];
      const isBlocked = blockedDomains.some(domain => hostname.includes(domain));
      
      if (isBlocked) {
        return {
          title: `Content from ${hostname}`,
          faviconUrl: `${urlObj.protocol}//${hostname}/favicon.ico`,
          summary: 'This site blocks automated content extraction. Summary not available.'
        };
      }

      // Try Jina AI for other sites
      const response = await fetch(`https://r.jina.ai/${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const text = await response.text();
      
      // Extract title - look for actual title, not "URL Source"
      let title = hostname; // fallback
      
      // Try to extract title from the response
      const titleMatch = text.match(/Title:\s*(.+?)(?:\n|$)/i);
      if (titleMatch && titleMatch[1] && 
          !titleMatch[1].includes('URL Source:') && 
          !titleMatch[1].includes('https://') &&
          titleMatch[1].trim().length > 0) {
        title = titleMatch[1].trim();
      } else {
        // If no good title found, use hostname with better formatting
        title = `Content from ${hostname}`;
      }
      
      // Generate favicon URL
      const faviconUrl = `${urlObj.protocol}//${hostname}/favicon.ico`;
      
      // Clean and truncate summary
      let summary = text
        .replace(/Title:.*?\n/i, '')
        .replace(/URL Source:.*?\n/i, '')
        .trim();
        
      // Truncate to 300 characters for better display
      if (summary.length > 300) {
        summary = summary.substring(0, 297) + '...';
      }
      
      if (!summary || summary.length < 10) {
        summary = 'Content summary not available for this URL.';
      }
      
      return {
        title,
        faviconUrl,
        summary
      };
    } catch (error) {
      console.error('Error fetching metadata:', error);
      // Fallback metadata
      const urlObj = new URL(url);
      return {
        title: `Content from ${urlObj.hostname}`,
        faviconUrl: `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`,
        summary: 'Content extraction failed. This site may block automated access.'
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !user) return;

    setLoading(true);
    try {
      // Validate URL
      new URL(url);
      
      // Fetch metadata and summary
      const metadata = await fetchMetadata(url);
      
      // Save to database
      const { error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          original_url: url,
          title: metadata.title,
          favicon_url: metadata.faviconUrl,
          summary_text: metadata.summary,
          tags: tags
        });

      if (error) throw error;

      toast({
        title: "Bookmark saved!",
        description: "Your link has been saved successfully.",
      });

      // Reset form
      setUrl('');
      setTags([]);
      setCustomTags('');
      
      // Refresh bookmarks
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      
      onSuccess();
    } catch (error: any) {
      console.error('Error saving bookmark:', error);
      toast({
        title: "Error saving bookmark",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="url">Website URL</Label>
        <Input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          💡 Try public sites like Wikipedia, MDN, or tech blogs for best results
        </p>
      </div>

      <div>
        <Label htmlFor="tags">Tags (optional)</Label>
        <div className="flex gap-2 mb-2">
          <Input
            id="tags"
            value={customTags}
            onChange={(e) => setCustomTags(e.target.value)}
            placeholder="Add a tag"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <Button type="button" onClick={addTag} variant="outline" size="sm">
            <Tag className="h-4 w-4" />
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" disabled={loading || !url.trim()}>
        {loading ? 'Saving...' : 'Save Bookmark'}
      </Button>
    </form>
  );
};

export default BookmarkForm;
