/**
 * expo-camera's `CameraView` scans a wider set of formats than the app can redisplay:
 * `@aramir/react-native-barcode` (JsBarcode) only draws linear 1D barcodes, and 2D/stacked
 * codes other than QR (aztec, datamatrix, pdf417) have no renderer in this app.
 *
 * This map is BOTH:
 * - the allow-list passed to `barcodeScannerSettings.barcodeTypes` in the scan screen
 * - the translation from expo-camera's scanned `type` to the format string stored in
 *   `QRCode.format` / rendered by `app/(features)/(cards)/qrcode.tsx`
 *
 * Do not add aztec/datamatrix/pdf417 here without also adding a renderer for them.
 */
import { BarcodeType } from "expo-camera";

/**
 * expo-camera's `CameraView` scans a wider set of formats than the app can redisplay:
 * `@aramir/react-native-barcode` (JsBarcode) only draws linear 1D barcodes, and 2D/stacked
 * codes other than QR (aztec, datamatrix, pdf417) have no renderer in this app.
 *
 * This map is BOTH:
 * - the allow-list passed to `barcodeScannerSettings.barcodeTypes` in the scan screen
 * - the translation from expo-camera's scanned `type` to the format string stored in
 *   `QRCode.format` / rendered by `app/(features)/(cards)/qrcode.tsx`
 *
 * Do not add aztec/datamatrix/pdf417 here without also adding a renderer for them.
 */
export const SUPPORTED_SCAN_TO_RENDER_FORMAT: Record<BarcodeType, string> = {
  qr: "QR",
  code39: "CODE39",
  code93: "CODE93",
  code128: "CODE128",
  ean13: "EAN13",
  ean8: "EAN8",
  upc_a: "UPC",
  upc_e: "UPCE",
  itf14: "ITF14",
  codabar: "codabar",
  // Scannable by expo-camera but not re-renderable by @aramir/react-native-barcode: excluded
  // from SUPPORTED_BARCODE_SCANNER_TYPES below, kept here only so the Record<BarcodeType, ...>
  // stays exhaustive and a future expo-camera upgrade doesn't silently drop this constraint.
  aztec: "",
  datamatrix: "",
  pdf417: "",
};

const UNSUPPORTED_FOR_RENDER: BarcodeType[] = ["aztec", "datamatrix", "pdf417"];

export const SUPPORTED_BARCODE_SCANNER_TYPES: BarcodeType[] = (
  Object.keys(SUPPORTED_SCAN_TO_RENDER_FORMAT) as BarcodeType[]
).filter((type) => !UNSUPPORTED_FOR_RENDER.includes(type));

export function isScannedTypeSupported(scannedType: string): scannedType is BarcodeType {
  return (
    scannedType in SUPPORTED_SCAN_TO_RENDER_FORMAT &&
    !UNSUPPORTED_FOR_RENDER.includes(scannedType as BarcodeType)
  );
}

export function renderFormatFromScannedType(scannedType: BarcodeType): string {
  return SUPPORTED_SCAN_TO_RENDER_FORMAT[scannedType] || "QR";
}
