import { CustomCanteenCardData } from "@/services/custom-canteen/types";

import CustomCanteenCard from "../models/CustomCanteenCard";

export function mapCustomCanteenCardToShared(
  card: CustomCanteenCard
): CustomCanteenCardData {
  return {
    codeValue: card.codeValue,
    codeFormat: card.codeFormat,
    label: card.label,
    balanceAmount: card.balanceAmount,
    currency: card.currency,
  };
}
