import {SignatureRequest, signatureRequest} from "./signatureRequest";


export default class TransactionBuilder {

  constructor() {

  }

  async createSmartContract(): Promise<SignatureRequest> {

    const transaction = "TRANSACTION REQUEST 1";

    return signatureRequest(transaction, signedTransaction => {
      return signedTransaction;
    });
  }
}
