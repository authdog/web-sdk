import React from 'react';
import '../dist/styles.css';

// This is the main entry point for Ladle
export default function Main({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
} 