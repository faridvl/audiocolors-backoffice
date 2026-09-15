import React from 'react';
import { RainbowStripe } from './rainbow-stripe';

/**
 * Banda de marca de las pantallas publicas (login): la franja de colores del
 * sitio publico, sola. En el back-office no se usa — ahi competiria con los
 * datos en cada pantalla.
 */
export const BrandTopbar: React.FC = () => <RainbowStripe />;
