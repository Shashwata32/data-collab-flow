import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Settings,
  Share2,
  Download,
  Plus,
  Search,
  Bell,
  ChevronDown,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const collaborators = [
  { id: 1, name: "Sarah Chen", avatar: "/avatars/sarah.jpg", status: "online", color: "user-1" },
  { id: 2, name: "Mike Rodriguez", avatar: "/avatars/mike.jpg", status: "online", color: "user-2" },
  { id: 3, name: "Emily Watson", avatar: "/avatars/emily.jpg", status: "away", color: "user-3" },
  { id: 4, name: "David Kim", avatar: "/avatars/david.jpg", status: "offline", color: "user-4" },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [activeWorkspace, setActiveWorkspace] = useState("Marketing Analytics");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">DataCollab</h1>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  {activeWorkspace}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setActiveWorkspace("Marketing Analytics")}>
                  Marketing Analytics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveWorkspace("Finance Dashboard")}>
                  Finance Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveWorkspace("Sales Performance")}>
                  Sales Performance
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Plus className="h-4 w-4 mr-2" />
                  New Workspace
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <Button variant="ghost" size="icon">
              <Search className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></span>
            </Button>

            {/* Collaborators */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Live:</span>
              <div className="flex -space-x-2">
                {collaborators.slice(0, 3).map((user, index) => (
                  <Avatar key={user.id} className="h-8 w-8 border-2 border-background relative">
                    <AvatarFallback className={`bg-${user.color} text-white text-xs`}>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                    {user.status === "online" && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-chart-2 border-2 border-background rounded-full"></div>
                    )}
                  </Avatar>
                ))}
                {collaborators.length > 3 && (
                  <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs text-muted-foreground">
                    +{collaborators.length - 3}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button size="sm" className="gap-2 bg-gradient-primary">
                <Plus className="h-4 w-4" />
                Add Chart
              </Button>
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarFallback className="bg-primary text-primary-foreground">JD</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>John Doe</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}