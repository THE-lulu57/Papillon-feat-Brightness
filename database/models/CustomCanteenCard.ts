// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class CustomCanteenCard extends Model {
	static table = "customcanteencards";

	@field('createdByAccount') createdByAccount: string;
	@field('codeValue') codeValue: string;
	@field('codeFormat') codeFormat: string;
	@field('label') label: string;
	@field('balanceAmount') balanceAmount: number;
	@field('currency') currency: string;
}
