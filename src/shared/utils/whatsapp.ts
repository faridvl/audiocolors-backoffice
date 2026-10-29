import { toInternationalDigits } from '@/shared/utils/phone';

/**
 * Enlace `wa.me` con el mensaje ya escrito. Abre WhatsApp (app o web) en la
 * conversación con el paciente; el envío lo hace la persona, no la app.
 * Devuelve null si el teléfono no sirve para WhatsApp.
 */
export function buildWhatsAppLink(phone: string | undefined, message: string): string | null {
  const internationalNumber = toInternationalDigits(phone ?? '');
  if (!internationalNumber) return null;

  return `https://wa.me/${internationalNumber}?text=${encodeURIComponent(message)}`;
}
