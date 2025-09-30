import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PageHeaderDisplay } from "@/contexts/PageHeaderContext";
import { Inbox } from "@/components/projects/inbox";

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b pb-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-2" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-6"
        />
        <div className="text-base font-medium flex-1">
          <PageHeaderDisplay
            fallback={<h1 className="text-base font-black">Club Sync</h1>}
          />
        </div>
        <div className="flex justify-end">
          <Inbox />
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
