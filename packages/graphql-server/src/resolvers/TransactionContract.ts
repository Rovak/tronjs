import {client} from "./network";

export async function triggerSmartContract({ parametersRaw }) {

  const contract = await client.getContractAbi(parametersRaw.contract_address);

  const data = contract.decodeInput(parametersRaw.data);

  return {
    method: data.name,
    params: data.params,
  };
}
