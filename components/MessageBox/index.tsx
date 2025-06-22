"use client";

import React from "react";
import Button from "@/components/Button";
import { MessageBoxProps } from "@/context/MessageContext";

const MessageBox: React.FC<MessageBoxProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "alert",
  confirmText = "OK",
  cancelText = "Cancel",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0 bg-black opacity-50 pointer-events-none" />
      <div className="relative bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full transform transition-all scale-100 opacity-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-700 mb-6">{message}</p>
        <div
          className={`flex ${
            type === "confirm" ? "justify-end space-x-3" : "justify-center"
          }`}
        >
          {type === "confirm" && (
            <Button variant="secondary" onClick={onClose} className="px-4 py-2">
              {cancelText}
            </Button>
          )}
          <Button
            variant={type === "confirm" ? "primary" : "primary"}
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
            className="px-4 py-2"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageBox;
