import {mapTransaction} from "./utils";

export function transactionAt({ transactions = [], id }, { index }) {
  const tx = transactions[parseInt(index)];
  if (tx) {
    return mapTransaction(tx);
  }

  return null;
}
