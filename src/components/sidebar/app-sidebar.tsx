import { Calendar, Home, Users, Wrench } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { TeamsMenu } from "./team-menu";
import { NavUser } from "./nav-user";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Events Calendar",
    url: "/events",
    icon: Calendar,
  },
  {
    title: "Projects",
    url: "/projects",
    icon: Wrench,
  },
  {
    title: "Manage Teams",
    url: "/teams",
    icon: Users,
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col">
        <SidebarGroup>
          <SidebarGroupLabel>Task Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <TeamsMenu />
              </SidebarMenuItem>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      onClick={() => void navigate(item.url)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          navigate(item.url);
                        }
                      }}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Spacer to push logout button to bottom */}
        <div className="flex-1" />

        <SidebarGroup className="mt-auto">
          <NavUser user={user} onLogout={handleLogout} />
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
