"use client";

import { useEffect, useState } from "react";

export interface ToastMessage {
  id: string;
  type: "success" | "error";
  text: string;
}

interface ToastProps {
  message: ToastMessage;
  onClose: (id: string) => void;
}

function ToastItem({ message, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));

    // Auto dismiss after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(message.id);
    }, 300);
  };

  return (
    <div
      className={`flex items-center gap-4 px-6 py-4 rounded-xl shadow-xl transition-all duration-300 min-w-[320px] max-w-[420px] ${
        isVisible && !isLeaving
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-full"
      } ${
        message.type === "success"
          ? "bg-[#5b8fa8] text-white"
          : "bg-[#c97b7b] text-white"
      }`}
      style={{ fontFamily: "var(--font-montserrat)" }}
    >
      {/* Icon */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          message.type === "success" ? "bg-white/20" : "bg-white/20"
        }`}
      >
        {message.type === "success" ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )}
      </div>

      {/* Message */}
      <span className="text-base font-medium flex-1">{message.text}</span>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-2 hover:bg-white/20 rounded-full transition-colors"
        aria-label="Zatvori"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

interface ToastContainerProps {
  messages: ToastMessage[];
  onClose: (id: string) => void;
}

export function ToastContainer({ messages, onClose }: ToastContainerProps) {
  if (messages.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {messages.map((message) => (
        <ToastItem key={message.id} message={message} onClose={onClose} />
      ))}
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const showToast = (type: "success" | "error", text: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setMessages((prev) => [...prev, { id, type, text }]);
  };

  const closeToast = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  return { messages, showToast, closeToast };
}
