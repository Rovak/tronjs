import {pipe} from "rxjs";
import {filter, concatMap} from "rxjs/operators";
import ContractLoader from "./contractLoader";


export function filterContractType(contractType) {
  return filter((tx: any) => tx.raw_data.contract[0].type === contractType);
}

/**
 * Extracts the smart contract input data from the given account
 */
export function extractSmartContractInputs(contractLoader?: ContractLoader) {

  contractLoader = contractLoader || new ContractLoader();

  return concatMap(async (tx: any) =>  {
    const smartContractParams = tx.raw_data.contract[0].parameter.value;
    const contractObj = await contractLoader.get(smartContractParams.contract_address);

    return {
      _contract: {
        address: smartContractParams.contract_address,
        name: contractObj.name,
      },
      ...contractObj.decodeInput(smartContractParams.data),
      ...smartContractParams,
    };
  });
}
