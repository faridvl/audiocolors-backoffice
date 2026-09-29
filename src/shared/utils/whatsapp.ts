/** Código de país de Costa Rica: los teléfonos se guardan con 8 dígitos, sin él. */
const DEFAULT_COUNTRY_CODE = '506';
const LOCAL_PHONE_LENGTH = 8;

/**
 * Enlace `wa.me` con el mensaje ya escrito. Abre WhatsApp (app o web) en la
 * conversación con el paciente; el envío lo hace la persona, no la app.
 * Devuelve null si el teléfono no sirve para WhatsApp.
 */
export function buildWhatsAppLink(phone: string | undefined, message: string): string | null {
  const digits = (phone ?? '').replace(/\D/g, '');
  if (!digits) return null;

  const internationalNumber =
    digits.length === LOCAL_PHONE_LENGTH ? `${DEFAULT_COUNTRY_CODE}${digits}` : digits;

  return `https://wa.me/${internationalNumber}?text=${encodeURIComponent(message)}`;
}
