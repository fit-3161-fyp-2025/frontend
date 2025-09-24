import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "./dialog";
import { Button } from "./button";

export function useConfirm() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<{ title?: string; description?: string; onConfirm?: () => void }>();

  const confirm = (opts: { title?: string; description?: string; onConfirm: () => void }) => {
    setConfig(opts);
    setOpen(true);
  };

  const DialogEl = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        {config?.title && <DialogTitle>{config.title}</DialogTitle>}
        {config?.description && <DialogDescription>{config.description}</DialogDescription>}
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => { setOpen(false); config?.onConfirm?.(); }}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { confirm, DialogEl } as const;
}




