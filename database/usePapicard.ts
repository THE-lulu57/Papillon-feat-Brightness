import { Q } from "@nozbe/watermelondb";
import * as FileSystem from "expo-file-system/legacy";

import { getDatabaseInstance } from "./DatabaseProvider";
import Papicard from "./models/Papicard";
import { safeWrite } from "./utils/safeTransaction";
import { Balance } from "@/services/shared/balance";
import { Services } from "@/stores/account/types";
import { useAccountStore } from "@/stores/account";
import { info, warn } from "@/utils/logger/logger";

function getActiveAccountId(): string {
  const { lastUsedAccount } = useAccountStore.getState();
  if (!lastUsedAccount) {
    throw new Error("Aucun compte actif");
  }
  return lastUsedAccount;
}

function tryGetDatabase() {
  try {
    return getDatabaseInstance();
  } catch {
    return null;
  }
}


export async function addPapicard(
  label: string,
  type: string,
  data: string,
  color: string
): Promise<void> {
  const accountId = getActiveAccountId();
  const db = getDatabaseInstance();

  await safeWrite(
    db,
    async () => {
      await db.get<Papicard>("papicard").create((card) => {
        card.label = label;
        card.type = type;
        card.data = data;
        card.color = color.toUpperCase();
        card.accountId = accountId;
      });
      info("🍉 Papicard created");
    },
    10000,
    "add_papicard"
  );
}


export async function getPapicardsAsBalances(): Promise<Balance[]> {
  try {
    const db = getDatabaseInstance();
    const accountId = getActiveAccountId();

    const cards = await db
      .get<Papicard>("papicard")
      .query(Q.where("account_id", accountId))
      .fetch();

    return cards.map((card) => ({
      amount: 0,
      currency: "",
      lunchRemaining: 0,
      lunchPrice: 0,
      label: card.label,
      createdByAccount: `papicard_${card.id}`,
      serviceId: Services.PAPICARD,
      qrData: card.data,
      qrType: card.type,
      color: card.color,
    }));
  } catch (error) {
    warn(`getPapicardsAsBalances: ${String(error)}`);
    return [];
  }
}

export async function removePapicard(cardId: string): Promise<void> {
  if (!cardId?.trim()) throw new Error("cardId invalide");

  const db = getDatabaseInstance();
  const accountId = getActiveAccountId();

  try {
    await safeWrite(
      db,
      async () => {
        const card = await db.get<Papicard>("papicard").find(cardId);

        if (card.accountId !== accountId) {
          throw new Error("Cette carte n'appartient pas au compte actif");
        }

        const isImage = card.type === "IMAGE" && !!card.data;
        const imagePath = card.data;

        await card.destroyPermanently();
        info("🍉 Papicard deleted");

        if (isImage) {
          await FileSystem.deleteAsync(imagePath, { idempotent: true });
        }
      },
      10000,
      "remove_papicard"
    );
  } catch (error) {
    warn(`removePapicard: ${String(error)}`);
    throw error;
  }
}

export function observePapicardsCount(callback: (count: number) => void): () => void {
  const { lastUsedAccount } = useAccountStore.getState();
  if (!lastUsedAccount) {
    callback(0);
    return () => {};
  }

  const db = tryGetDatabase();
  if (!db) {
    warn("observePapicardsCount: DB non prête, count forcé à 0");
    callback(0);
    return () => {};
  }

  const subscription = db
    .get<Papicard>("papicard")
    .query(Q.where("account_id", lastUsedAccount))
    .observe()
    .subscribe({
      next: (cards) => callback(cards.length),
      error: (err) => {
        warn(`observePapicardsCount: ${String(err)}`);
        callback(0);
      },
    });

  return () => subscription.unsubscribe();
}