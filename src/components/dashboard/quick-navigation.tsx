import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  FolderOpen, 
  Users
} from "lucide-react";
import { useNavigate } from "react-router";

export function QuickNavigation() {
  const navigate = useNavigate();

  const navigationItems = [
    {
      title: "Calendar",
      description: "View and manage events",
      icon: Calendar,
      action: () => navigate("/events"),
      color: "bg-blue-500",
    },
    {
      title: "Projects", 
      description: "Manage project tasks",
      icon: FolderOpen,
      action: () => navigate("/projects"),
      color: "bg-green-500",
    },
    {
      title: "Teams",
      description: "Manage your teams",
      icon: Users,
      action: () => navigate("/teams"),
      color: "bg-purple-500",
    },
  ];


  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Main Navigation */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Quick Navigation
          </CardTitle>
          <CardDescription>
            Access your main workspace areas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {navigationItems.map((item) => (
            <Button
              key={item.title}
              variant="ghost"
              className="w-full justify-start h-auto p-4 hover:bg-accent"
              onClick={item.action}
            >
              <div className="flex items-center space-x-3 w-full">
                <div className={`p-2 rounded-md ${item.color} text-white`}>
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-muted-foreground">{item.description}</div>
                </div>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

    </div>
  );
}
