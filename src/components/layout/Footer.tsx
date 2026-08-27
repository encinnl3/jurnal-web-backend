import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-bg-primary border-t border-border py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="font-display font-bold text-text-primary">
          PKL <span className="text-accent-teal">JOURNAL</span>
        </div>
        <p className="font-inter text-xs text-text-muted">
          Made with ☕ during PKL © 2025
        </p>
      </div>
    </footer>
  );
};
