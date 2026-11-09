import React from 'react';

interface CategoryPillProps {
  children: React.ReactNode;
}

/** Píldora de la categoría de una nota o un archivo (Pruebas, Garantías...). */
export const CategoryPill: React.FC<CategoryPillProps> = ({ children }) => (
  <span className="w-fit rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
    {children}
  </span>
);
