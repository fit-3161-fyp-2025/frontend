import { Outlet, useLocation } from "react-router";
import { AppSidebar } from "./components/sidebar/app-sidebar";
import { SidebarProvider } from "./components/ui/sidebar";
import { useTokenRefresh } from "./hooks/useTokenRefresh";
import { PageHeaderProvider } from "./contexts/PageHeaderContext";
import { SiteHeader } from "./components/site-header";
import { useEffect } from "react";
import { usePageHeader } from "./contexts/PageHeaderContext";

function RouteHeaderSetter() {
  const location = useLocation();
  const { setHeaderText, setHeader } = usePageHeader();

  useEffect(() => {
    // Simple mapping of routes to header text. Extend as needed.

    // Define mappings. Use '/*' suffix for prefix/wildcard matching.
    const map: Record<string, string> = {
      "/projects/*": "Projects",
      "/dashboard": "Dashboard",
      "/events": "Events",
      "/settings": "Settings",
      "/login": "",
      "/signup": "",
    };

    // Exact match first
    let header = map[location.pathname];

    // If no exact match, attempt wildcard/prefix matches (keys ending with '/*')
    if (header === undefined) {
      for (const key of Object.keys(map)) {
        if (key.endsWith("/*")) {
          const prefix = key.slice(0, -2);
          if (
            location.pathname === prefix ||
            location.pathname.startsWith(prefix + "/")
          ) {
            header = map[key];
            break;
          }
        }
      }
    }

    if (header === undefined || header === "") {
      // No mapping or explicit empty mapping — clear header
      setHeader(null);
      return;
    }

    setHeaderText(header, null);

    // Clear header when unmounting / location changes away
    return () => setHeader(null);
  }, [location.pathname, setHeaderText, setHeader]);

  return null;
}

export function Layout() {
  // Prevent these paths from doing the refresh logic
  useTokenRefresh({
    excludeRoutes: ["/login", "/signup", "/"],
  });

  return (
    <SidebarProvider>
      <AppSidebar />
      <PageHeaderProvider>
        <RouteHeaderSetter />
        <main className="m-4 w-full min-w-0">
          <SiteHeader />

          <div className="mt-2">
            <Outlet />
          </div>
        </main>
      </PageHeaderProvider>
    </SidebarProvider>
  );
}
