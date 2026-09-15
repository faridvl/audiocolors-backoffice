import React from 'react';
import Image from 'next/image';

/**
 * Layout de pantalla partida para paginas publicas (login).
 * Mismo patron que el backoffice de comx: imagen fija a la izquierda,
 * contenido con scroll propio a la derecha.
 */
interface SplitScreenLayoutProps {
  imageSrc: string;
  imageAlt: string;
  children: React.ReactNode;
}

export const SplitScreenLayout: React.FC<SplitScreenLayoutProps> = ({
  imageSrc,
  imageAlt,
  children,
}) => (
  <div className="flex h-screen w-screen overflow-hidden">
    <div className="relative hidden w-1/2 shrink-0 md:block">
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority
        sizes="50vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-navy-900/55" />
      <div className="absolute inset-x-0 bottom-0 p-10">
        <p className="max-w-md text-2xl font-bold leading-snug text-white">
          Los expedientes de tus pacientes, en un solo lugar.
        </p>
        <p className="mt-2 max-w-md text-sm text-navy-200">
          Datos, recetas, audiometrias y documentos desde cualquier dispositivo.
        </p>
      </div>
    </div>

    <div className="flex w-full flex-col overflow-y-auto md:w-1/2">
      <div className="flex w-full flex-1 items-center justify-center px-5 py-10 sm:px-8">
        {children}
      </div>
    </div>
  </div>
);
