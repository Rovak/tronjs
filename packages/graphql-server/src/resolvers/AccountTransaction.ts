import {tronWeb} from "./network";

export async function tx({ hash }) {
  const tx = await tronWeb.trx.getTransaction(hash);
  const contract = tx.raw_data.contract[0];
  return {
    id: tx.txID,
    contract: {
      type: contract.type,
      parametersRaw: contract.parameter.value,
    }
  }
}
