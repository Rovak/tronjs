import * as interfaces from "./index";
import {Transaction} from "./index";

export default class Block implements interfaces.Block {

  number: number;
  transactions: Transaction[];

  constructor(options: any = {}) {
    this.transactions = options.transactions || [];
    this.number = options.number;
  }

  /**
   * Retrieve transactions
   */
  getTransactions(): Transaction[] {
    return this.transactions;
  }
}
