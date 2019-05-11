import {smartContractHexToAddress} from "../../utils/address";


export function prepareEventData(result: any, types: any) {
  const data = result;

  for (let [name, type] of Object.entries(types)) {
    if (type === 'address') {
      data[name] = smartContractHexToAddress(data[name]);
    }
  }

  return data;
}

export function mapEvent(event: any): ContractEvent {
  return {
    block: event.block_number,
    timestamp: event.block_timestamp,
    contract: event.contract_address,
    index: event.event_index,
    name: event.event_name,
    transaction: event.transaction_id,
    result: prepareEventData(event.result, event.result_type),
    resourceNode: event.resource_Node
  }
}

export interface ContractEvent {
  block: number;
  index: number;
  timestamp: number;
  contract: string;
  name: string;
  transaction: string;
  result: { [key: string]: any };
  resourceNode: string;
}
