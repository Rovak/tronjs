import {SignatureRequest} from "../transaction/signatureRequest";

export default class WalletTransactionSigner {

  sign(signatureRequest: SignatureRequest) {
    return new Promise(resolve => {
      resolve(signatureRequest(transaction => {
        return "WALLET SIGNED (" + transaction + ")";
      }));
    });
  }
}
