import * as interfaces from "./index";

export default class Transaction implements interfaces.Transaction {

  hash: string;

  constructor(options: any = {}) {
    this.hash = options.hash;
  }
}
