import React from 'react';

// This is the preview component for Ladle
export default function Preview({ children }: { children: React.ReactNode }) {
  return (
    <div className="ladle-main">
      {children}
    </div>
  );
} 