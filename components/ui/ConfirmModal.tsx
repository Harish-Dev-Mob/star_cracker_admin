"use client";

import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = true,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" hideCloseButton>
      <div className="text-center pb-2">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto border ${isDestructive ? 'bg-red-50 text-red-500 border-red-100' : 'bg-blue-50 text-blue-500 border-blue-100'}`}>
          {isDestructive ? '⚠️' : '❓'}
        </div>
        <h2 className="text-2xl font-black text-[var(--color-text)] mb-2 font-display">{title}</h2>
        <p className="text-[var(--color-text-muted)] mb-8 font-medium">
          {message}
        </p>
        <div className="flex gap-3 mt-4">
          <Button variant="secondary" onClick={onClose} className="flex-1 py-4 h-auto rounded-xl font-bold">
            {cancelText}
          </Button>
          <Button
            variant={isDestructive ? "destructive" : "primary"}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-4 h-auto rounded-xl font-bold"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
