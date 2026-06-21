export function normalizeInquiryPhone(value: string): string {
  return value.replace(/[\s-]/g, "");
}
