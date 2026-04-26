import { GenericInterface } from "./types";
import { Services } from "@/stores/account/types";

export interface Balance extends GenericInterface {
	serviceId?: Services;
	amount: number;
	currency: string;
	lunchRemaining: number;
	lunchPrice: number;
	label: string
}
