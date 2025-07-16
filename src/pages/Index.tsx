
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, Bookmark, Zap, Shield, Search, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Bookmark className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Link Saver + Auto-Summary
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Save any link and get instant AI-powered summaries. Never lose track of important content again.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="text-lg px-8 py-3"
            >
              Get Started Free
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/auth')}
              className="text-lg px-8 py-3"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full w-fit mb-4">
                <Link className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Save Any Link</CardTitle>
              <CardDescription>
                Paste any URL and we'll automatically fetch the title, favicon, and page content.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto p-3 bg-green-100 dark:bg-green-900/30 rounded-full w-fit mb-4">
                <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>AI Summaries</CardTitle>
              <CardDescription>
                Get instant AI-powered summaries of any webpage using advanced content analysis.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full w-fit mb-4">
                <Search className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Smart Organization</CardTitle>
              <CardDescription>
                Tag, filter, and reorder your bookmarks with drag-and-drop functionality.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Additional Features */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>
                Your bookmarks are stored securely with user authentication and row-level security.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• End-to-end encryption</li>
                <li>• Private bookmark collections</li>
                <li>• Secure user authentication</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Moon className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Dark Mode & More</CardTitle>
              <CardDescription>
                Beautiful interface with dark mode support and responsive design.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• Light and dark themes</li>
                <li>• Mobile-responsive design</li>
                <li>• Drag-and-drop reordering</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
