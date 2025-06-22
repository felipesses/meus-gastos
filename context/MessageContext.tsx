"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import MessageBox from "@/components/MessageBox";

export interface MessageBoxProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: "alert" | "confirm";
  confirmText?: string;
  cancelText?: string;
}

interface MessageContextType {
  showAlert: (title: string, message: string, confirmText?: string) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText?: string,
    cancelText?: string
  ) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

interface MessageProviderProps {
  children: ReactNode;
}

export const MessageProvider = ({ children }: MessageProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messageBoxProps, setMessageBoxProps] = useState<
    Omit<MessageBoxProps, "isOpen" | "onClose">
  >({
    title: "",
    message: "",
    type: "alert",
  });

  const showAlert = useCallback(
    (title: string, message: string, confirmText?: string) => {
      setMessageBoxProps({
        title,
        message,
        type: "alert",
        confirmText,
      });
      setIsOpen(true);
    },
    []
  );

  const showConfirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      confirmText?: string,
      cancelText?: string
    ) => {
      setMessageBoxProps({
        title,
        message,
        type: "confirm",
        onConfirm,
        confirmText,
        cancelText,
      });
      setIsOpen(true);
    },
    []
  );

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setMessageBoxProps((prev) => ({ ...prev, onConfirm: undefined })); // Clear onConfirm to prevent stale closures
  }, []);

  return (
    <MessageContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <MessageBox isOpen={isOpen} onClose={handleClose} {...messageBoxProps} />
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error("useMessage must be used within a MessageProvider");
  }
  return context;
};
