import TransactionSigner from "./transactionSigner";

export default class TronWebTransactionSigner implements TransactionSigner {

  tronWeb: any;

  constructor(tronWeb) {
    this.tronWeb = tronWeb;
  }

  async signHash(transactionHash: string) {
    console.log("Signing", transactionHash);
    const signedTransaction = await this.tronWeb.trx.sign({
      txID: transactionHash,
    });

    return signedTransaction.signature;
  }

}
