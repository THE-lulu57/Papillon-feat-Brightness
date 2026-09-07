import { Model, Q } from "@nozbe/watermelondb";

import { CustomCanteenCardData } from "@/services/custom-canteen/types";
import { warn } from "@/utils/logger/logger";

import { getDatabaseInstance } from "./DatabaseProvider";
import { mapCustomCanteenCardToShared } from "./mappers/customCanteenCard";
import CustomCanteenCard from "./models/CustomCanteenCard";
import { safeWrite } from "./utils/safeTransaction";

/**
 * WatermelonDB here is a reactive-query mirror, NOT the source of truth: the canonical
 * scanned code lives in the account's `ServiceAccount.auth.additionals` (MMKV via zustand
 * persist), which survives schema version bumps. This table only exists so custom cards
 * are queryable/cacheable the same way Balance/CanteenHistory are; it is safe to lose and
 * gets rebuilt from `additionals` on every `refreshAccount()` call.
 */
export async function upsertCustomCanteenCardToDatabase(
  accountId: string,
  data: CustomCanteenCardData
): Promise<void> {
  const db = getDatabaseInstance();
  const existing = await db
    .get<CustomCanteenCard>("customcanteencards")
    .query(Q.where("createdByAccount", accountId))
    .fetch();

  await safeWrite(
    db,
    async () => {
      if (existing.length > 0) {
        await existing[0].update((record: Model) => {
          const card = record as CustomCanteenCard;
          Object.assign(card, data);
        });
        return;
      }
      await db.get("customcanteencards").create((record: Model) => {
        const card = record as CustomCanteenCard;
        Object.assign(card, { createdByAccount: accountId, ...data });
      });
    },
    10000,
    "upsertCustomCanteenCardToDatabase"
  );
}

export async function getCustomCanteenCardFromCache(
  accountId: string
): Promise<CustomCanteenCardData | null> {
  try {
    const db = getDatabaseInstance();
    const cards = await db
      .get<CustomCanteenCard>("customcanteencards")
      .query(Q.where("createdByAccount", accountId))
      .fetch();

    return cards.length > 0 ? mapCustomCanteenCardToShared(cards[0]) : null;
  } catch (e) {
    warn(String(e));
    return null;
  }
}

export async function removeCustomCanteenCardFromDatabase(
  accountId: string
): Promise<void> {
  const db = getDatabaseInstance();
  const cards = await db
    .get<CustomCanteenCard>("customcanteencards")
    .query(Q.where("createdByAccount", accountId))
    .fetch();

  for (const card of cards) {
    await safeWrite(
      db,
      async () => {
        await card.markAsDeleted();
      },
      10000,
      "removeCustomCanteenCardFromDatabase"
    );
  }
}
