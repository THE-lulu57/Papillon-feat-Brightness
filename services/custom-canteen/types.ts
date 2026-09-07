export interface CustomCanteenCardData {
  codeValue: string;
  /** Concrete render format, e.g. "QR", "CODE39", "EAN13"... see formats.ts */
  codeFormat: string;
  label: string;
  /** Manually entered by the user at creation time, in cents. Never auto-updated. */
  balanceAmount: number;
  currency: string;
}
