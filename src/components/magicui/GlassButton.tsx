import React from "react";

interface GlassButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

const GlassButton = ({ children, href, onClick }: GlassButtonProps) => {
  const baseClasses = `
    relative inline-flex items-center justify-center px-6 py-3 rounded-2xl
    bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)]
    backdrop-blur-md shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]
    text-white font-semibold text-lg overflow-hidden
    transition-all duration-300 ease-in-out
    hover:scale-105 hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.5)]
  `;

  const pseudoClasses = `
    before:absolute before:inset-0 before:rounded-2xl
    before:bg-gradient-to-r before:from-white/20 via-white/40 to-white/20
    before:blur-xl before:opacity-50 before:transition-all before:duration-500
    before:animate-slide
  `;

  const content = (
    <span className="relative z-10 flex items-center gap-2">
      {children}
    </span>
  );

  const button = (
    <span className={`${baseClasses} ${pseudoClasses}`}>
      {content}
    </span>
  );

  return href ? <a href={href}>{button}</a> : <button onClick={onClick}>{button}</button>;
};

export default GlassButton;
