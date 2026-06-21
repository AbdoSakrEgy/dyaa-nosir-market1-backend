export function normalizeProfilePhone(value: string): string {
  const phone = value.replace(/[\s-]/g, "").replace(/^\+/, "");

  if (/^01[0125]\d{8}$/.test(phone)) return `2${phone}`;
  if (/^1[0125]\d{8}$/.test(phone)) return `20${phone}`;

  return phone;
}
