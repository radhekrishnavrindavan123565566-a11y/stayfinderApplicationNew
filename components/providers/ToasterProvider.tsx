"use client";
import { Toaster } from "react-hot-toast";

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: { borderRadius: "12px", background: "#1a1a1a", color: "#fff", fontSize: "14px" },
        success: { iconTheme: { primary: "#f43f5e", secondary: "#fff" } },
      }}
    />
  );
}
