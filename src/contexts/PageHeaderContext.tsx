import React from "react";
import { toast } from "sonner";

type PageHeaderContextType = {
  header: React.ReactNode | null;
  setHeader: (n: React.ReactNode | null) => void;
  setHeaderText: (title: string, subtitle?: string | null) => void;
};

const PageHeaderContext = React.createContext<PageHeaderContextType | null>(
  null
);

export const PageHeaderProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [header, setHeader] = React.useState<React.ReactNode | null>(null);

  const setHeaderText = React.useCallback(
    (title: string, subtitle?: string | null) => {
      setHeader(
        <div className="w-full">
          <div className="flex flex-col gap-1 py-1">
            <h1 className="text-lg font-semibold leading-none m-0">{title}</h1>
            {subtitle ? (
              <div className="text-sm text-muted-foreground">{subtitle}</div>
            ) : null}
          </div>
        </div>
      );
    },
    []
  );

  const value = React.useMemo(
    () => ({ header, setHeader, setHeaderText }),
    [header, setHeader, setHeaderText]
  );

  return (
    <PageHeaderContext.Provider value={value}>
      {children}
    </PageHeaderContext.Provider>
  );
};

export const usePageHeader = () => {
  const ctx = React.useContext(PageHeaderContext);
  if (!ctx) {
    toast.error("usePageHeader must be used within PageHeaderProvider");
    throw new Error("usePageHeader must be used within PageHeaderProvider");
  }
  return ctx;
};

// Convenience helper to set a simple text header (title + optional subtitle)
// `useSetHeaderText` helper removed: use `const { setHeaderText } = usePageHeader()` instead.

export function PageHeaderDisplay({
  className,
  fallback = null,
}: {
  className?: string;
  fallback?: React.ReactNode;
}) {
  const ctx = React.useContext(PageHeaderContext);
  if (!ctx) return null;
  const content = ctx.header ?? fallback;
  return <div className={className}>{content}</div>;
}

export default PageHeaderContext;
