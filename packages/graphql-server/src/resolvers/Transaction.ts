import {client} from "./network";
import {getInfo} from "./utils";

export function info({ id }) {
  return getInfo(id);
}

export async function events({ id }, _, context) {
  const transaction = await client.findTransactionInfoByHash(id);

  return transaction.getEventLog().map(event => ({
    name: event.name,
    contractAddress: event.contract,
    result: event.result,
  }))
}
