
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Moon, Sun, Plus, Search, Tag } from 'lucide-react';
import BookmarkForm from '@/components/BookmarkForm';
import BookmarkGrid from '@/components/BookmarkGrid';
import TagFilter from '@/components/TagFilter';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-foreground">LinkSaver</h1>
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.email}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
              >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Add Bookmark Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Save New Link
              </CardTitle>
              <Button 
                onClick={() => setShowAddForm(!showAddForm)}
                variant={showAddForm ? "secondary" : "default"}
              >
                {showAddForm ? 'Cancel' : 'Add Link'}
              </Button>
            </div>
          </CardHeader>
          {showAddForm && (
            <CardContent>
              <BookmarkForm onSuccess={() => setShowAddForm(false)} />
            </CardContent>
          )}
        </Card>

        {/* Search and Filter Section */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search your saved links..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="md:w-64">
                <TagFilter
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookmarks Grid */}
        <BookmarkGrid 
          searchQuery={searchQuery}
          selectedTags={selectedTags}
        />
      </div>
    </div>
  );
};

export default Dashboard;
