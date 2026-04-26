import { Model } from "@nozbe/watermelondb";
import { field } from "@nozbe/watermelondb/decorators";

export default class Papicard extends Model {
  static table = 'papicard';

  @field('label') label!: string;
  @field('type') type!: string;
  @field('data') data!: string;
  @field('color') color!: string;
  @field('account_id') accountId!: string;
}

