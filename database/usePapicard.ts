import { getDatabaseInstance } from "./DatabaseProvider";
import Papicard from "./models/Papicard";
import { Services } from "@/stores/account/types";
import { Balance } from "@/services/shared/balance";
import { useAccountStore } from "@/stores/account";
import { info, warn } from "@/utils/logger/logger";
import { safeWrite } from "./utils/safeTransaction";

export async function addPapicard(
  label: string,
  type: string,
  data: string,
  color: string
): Promise<void> {
  const db = getDatabaseInstance();
  const store = useAccountStore.getState();

  if (!store.lastUsedAccount) {
    throw new Error("Aucun compte actif");
  }

  let cardId: string;

  await safeWrite(
    db,
    async () => {
      const card = await db.get<Papicard>("papicard").create((newCard) => {
        newCard.label = label;
        newCard.type = type;
        newCard.data = data;
        newCard.color = color.toUpperCase();
      });

      cardId = card.id;
      info(`🍉 Papicard created`);
    },
    10000,
    "add_papicard"
  );
}


export async function getPapicardsAsBalances(): Promise<Balance[]> {
  try {
    const db = getDatabaseInstance();
    const cards = await db.get<Papicard>("papicard").query().fetch();

    return cards.map(
      (card) =>
        ({
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
        } as Balance & { qrData: string; qrType: string; color: string })
    );
  } catch (error) {
    warn(`Erreur lors de la récupération des Papicards: ${String(error)}`);
    return [];
  }
}

export function observePapicardsCount(callback: (count: number) => void) {
  const db = getDatabaseInstance();
  const subscription = db.get<Papicard>("papicard").query().observe().subscribe((cards) => {
    callback(cards.length);
  });
  return () => subscription.unsubscribe();
}
