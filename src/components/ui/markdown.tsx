import React from 'react';

// A simple and safe Markdown component that only handles **bold** text.
export function Markdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          // It's a bold part, remove the asterisks and wrap in <strong>
          return <strong key={index} className="font-semibold text-foreground/90">{part.slice(2, -2)}</strong>;
        }
        // It's a normal text part
        return part;
      })}
    </>
  );
}
