import {sha3} from "../utils/crypto";
import {getFunctionSelector} from "../utils/abi";
import {AbiEntry} from "./abi";

export default class EventAbi {

  private abi;
  readonly name: string;
  readonly functionSelector: string;
  readonly signature: string;

  public readonly type: string;

  constructor(abi: AbiEntry) {
    this.abi = abi;
    this.type = abi.type;
    this.name = abi.name;

    this.functionSelector = getFunctionSelector(abi);
    this.signature = sha3(this.functionSelector, false); //.slice(0, 8);
  }

  /**
   * Get IDs for this method
   */
  getIds(): { [key: string]: EventAbi } {
    return {
      [this.name]: this,
      [this.functionSelector]: this,
      [this.signature]: this,
      [this.signature.slice(0, 8)]: this,
    }
  };
}
