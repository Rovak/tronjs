import xhr from "axios";
import {getAccount} from "./utils";
import {prepareEventData} from "@trx/core/dist/blockchain/contract/events";

export function origin({ originAddress }) {
  return getAccount(originAddress);
}

export async function events({ address }, { since, page, limit, sort, event }) {

  let url = `https://api.trongrid.io/event/contract/${address}`;
  if (event) {
    url += `/${event}`;
  }

  const { data: events } = await xhr.get(url, {
    params: {
      since,
      page,
      size: limit,
      sort
    }
  });

  return events.map(ev => ({
    transactionId: ev.transaction_id,
    blockTimestamp: ev.block_timestamp,
    blockNumber: ev.block_number,
    eventName: ev.event_name,
    contractAddress: ev.contract_address,
    result: prepareEventData(ev.result, ev.result_type),
    resultRaw: ev.result,
    resultTypes: ev.result_type,
  }))
}
