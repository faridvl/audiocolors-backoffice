const PROFESSIONAL_NAME_SEPARATOR = ' · ';

interface ProfessionalNameInput {
  /** Título ya abreviado ("Lic."); vacío o nulo si el profesional no lo tiene. */
  title?: string | null;
  fullName: string;
  licenseNumber?: string | null;
  /** Prefijo del colegiado ya traducido ("Cód."). */
  licensePrefix: string;
}

/** "Lic. Ana Mora · Cód. 1234": el título y el colegiado salen solo si existen. */
export function formatProfessionalName({
  title,
  fullName,
  licenseNumber,
  licensePrefix,
}: ProfessionalNameInput): string {
  const name = [title?.trim(), fullName.trim()].filter(Boolean).join(' ');
  const license = licenseNumber?.trim();
  return license
    ? [name, `${licensePrefix} ${license}`].filter(Boolean).join(PROFESSIONAL_NAME_SEPARATOR)
    : name;
}
