import TransactionSigner from "./transactionSigner";
import {hexStr2byteArray} from "../utils/code";
import {ECKeySign} from "../utils/crypto";

export default class PrivateKeyTransactionSigner implements TransactionSigner {

  privateKey: string;

  constructor(privateKey: string) {
    this.setPrivateKey(privateKey);
  }

  setPrivateKey(privateKey: string) {
    this.privateKey = privateKey;
  }

  async signHash(transactionHash: string) {
    let priKeyBytes = hexStr2byteArray(this.privateKey);
    return ECKeySign(hexStr2byteArray(transactionHash), priKeyBytes);
  }

}
