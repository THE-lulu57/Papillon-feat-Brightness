import { upsertCustomCanteenCardToDatabase } from "@/database/useCustomCanteenCard";
import { Balance } from "@/services/shared/balance";
import { QRCode, QRType } from "@/services/shared/canteen";
import { Capabilities, SchoolServicePlugin } from "@/services/shared/types";
import { Auth, Services } from "@/stores/account/types";
import { error, warn } from "@/utils/logger/logger";

/**
 * A canteen "card" created locally by scanning a physical QR code / barcode, instead of
 * logging into a school's canteen provider. There is no remote API: the scanned code (and
 * the optional manually-entered balance) is the only data this plugin ever has, and it is
 * never refreshed from a server.
 *
 * The canonical value lives in `auth.additionals` (durable, MMKV-backed). WatermelonDB is
 * only kept in sync as a cache mirror, consistent with how Balance/CanteenHistory work for
 * the other providers — see database/useCustomCanteenCard.ts for why.
 */
export class CustomCanteen implements SchoolServicePlugin {
  displayName = "Carte personnalisée";
  service = Services.CUSTOM_CANTEEN;
  requiresInternet = false;
  capabilities: Capabilities[] = [
    Capabilities.CANTEEN_QRCODE,
    Capabilities.CANTEEN_BALANCE,
  ];
  authData: Auth = {};
  session = undefined;

  constructor(public accountId: string) {}

  async refreshAccount(credentials: Auth): Promise<CustomCanteen> {
    this.authData = credentials;

    const additionals = credentials.additionals;
    if (additionals?.codeValue) {
      try {
        await upsertCustomCanteenCardToDatabase(this.accountId, {
          codeValue: String(additionals.codeValue),
          codeFormat: String(additionals.codeFormat ?? "QR"),
          label: String(additionals.label ?? this.displayName),
          balanceAmount: Number(additionals.balanceAmount ?? 0),
          currency: String(additionals.currency ?? "€"),
        });
      } catch (e) {
        // Non-fatal: the card still works from `authData` alone, this is only the cache mirror.
        warn(String(e), "CustomCanteen.refreshAccount");
      }
    }

    return this;
  }

  async getCanteenQRCodes(): Promise<QRCode> {
    const additionals = this.authData.additionals;
    if (!additionals?.codeValue) {
      throw error(
        "Aucun code enregistré pour cette carte",
        "CustomCanteen.getCanteenQRCodes"
      );
    }

    const codeFormat = String(additionals.codeFormat ?? "QR");

    return {
      type: codeFormat === "QR" ? QRType.QRCode : QRType.Barcode,
      format: codeFormat,
      data: String(additionals.codeValue),
      createdByAccount: this.accountId,
    };
  }

  async getCanteenBalances(): Promise<Balance[]> {
    const additionals = this.authData.additionals;

    return [
      {
        amount: Number(additionals?.balanceAmount ?? 0),
        currency: String(additionals?.currency ?? "€"),
        lunchRemaining: 0,
        lunchPrice: 0,
        label: String(additionals?.label ?? this.displayName),
        createdByAccount: this.accountId,
      },
    ];
  }
}
