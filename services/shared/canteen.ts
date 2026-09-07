import { BookingDay as TurboBookingDay } from "turboself-api";
import { BookingDay as AliseBookingDay } from "alise-api";

import { GenericInterface } from "./types";

export interface CanteenMenu extends GenericInterface {
  date: Date;
  lunch?: Meal;
  dinner?: Meal;
}

export interface Meal {
  entry: Food[];
  main?: Food[];
  side?: Food[];
  cheese?: Food[];
  dessert?: Food[];
  drink?: Food[];
}

export interface Food {
  name: string;
  allergens?: string[];
}

export interface CanteenHistoryItem extends GenericInterface {
  date: Date;
  label: string;
  currency: string;
  amount: number;
}

export interface QRCode extends GenericInterface {
	type: QRType,
	data: string,
	/**
	 * Concrete render format for this specific code instance (e.g. "QR", "CODE39", "EAN13").
	 * Optional: services with a single, fixed format per service (ED, Izly...) can omit it and
	 * rely on the legacy static `getCodeType(service)` lookup. Services that can produce a
	 * different format per account (e.g. a user-scanned custom card) MUST set it, since a single
	 * `Services` enum value can no longer imply a single format.
	 */
	format?: string
}

export enum QRType {
	QRCode,
	Barcode
}

export interface BookingDay {
	date: Date,
	available: Booking[]
}

export interface Booking extends GenericInterface  {
	id: string,
	label: string,
	canBook: boolean,
	booked: boolean,
	ref?: TurboBookingDay
}

export enum CanteenKind {
  FORFAIT,
  ARGENT
}