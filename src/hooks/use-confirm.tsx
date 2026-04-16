"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "default";
}

interface ConfirmState extends ConfirmOptions {
  open: boolean;
  resolve: ((confirmed: boolean) => void) | null;
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({
    open: false,
    title: "",
    description: "",
    confirmLabel: "Confirmer",
    cancelLabel: "Annuler",
    variant: "destructive",
    resolve: null,
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        confirmLabel: "Confirmer",
        cancelLabel: "Annuler",
        variant: "destructive",
        ...options,
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    const resolve = state.resolve;
    setState((s) => ({ ...s, open: false, resolve: null }));
    resolve?.(true);
  }, [state.resolve]);

  const handleCancel = useCallback(() => {
    const resolve = state.resolve;
    setState((s) => ({ ...s, open: false, resolve: null }));
    resolve?.(false);
  }, [state.resolve]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) handleCancel();
    },
    [handleCancel]
  );

  const ConfirmDialog = useCallback(() => {
    return (
      <Dialog open={state.open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-sm!">
          <DialogHeader>
            <DialogTitle>{state.title}</DialogTitle>
            <DialogDescription>{state.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={handleCancel}>
              {state.cancelLabel}
            </Button>
            <Button
              variant={state.variant === "destructive" ? "destructive" : "default"}
              size="sm"
              onClick={handleConfirm}
            >
              {state.confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }, [state, handleCancel, handleConfirm, handleOpenChange]);

  return { confirm, ConfirmDialog };
}
