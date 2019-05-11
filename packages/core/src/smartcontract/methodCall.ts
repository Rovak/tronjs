import {addressToHex, addressToSmartContractHex} from "../utils/address";
import * as Ethers from "ethers";
import {isAddress, isInteger, isString} from "../utils/utils";
import TransactionCommand from "../transaction/transactionCommand";
import {isUndefined} from "lodash";
import MethodAbi from "./methodAbi";
import {getParamTypes} from "../utils/abi";

export default class MethodCall implements TransactionCommand {

  public contractAddress;
  public ownerAddress;
  public functionSelector;
  public feeLimit: number = 1_000_000_000;
  public parameters = [];
  public tokenId: number = null;
  public tokenAmount: number = 0;
  public trxAmount: number = 0;
  public abi: MethodAbi;

  public name = 'MethodCall';

  public constructor(options) {

    for (let [name, value] of Object.entries(options)) {

      if (isUndefined(value))
        continue;

      switch (name) {
        case "abi":
          // @ts-ignore
          this.setAbi(value);
          break;
        case "contractAddress":
          // @ts-ignore
          this.setContractAddress(value);
          break;
        case "ownerAddress":
          // @ts-ignore
          this.setOwnerAddress(value);
          break;
        case "functionSelector":
          // @ts-ignore
          this.setFunctionSelector(value);
          break;
        case "feeLimit":
          // @ts-ignore
          this.setFeeLimit(value);
          break;
        case "parameters":
          // @ts-ignore
          this.setParameters(value);
          break;
        case "token":
          // @ts-ignore
          this.setToken(value.id, value.amount);
          break;
        case "trxAmount":
          // @ts-ignore
          this.setTrxAmount(value);
          break;
      }
    }
  }

  setAbi(methodAbi: MethodAbi) {
    this.abi = methodAbi;
    return this;
  }

  setContractAddress(contractAddress: string) {
    if (!isAddress(contractAddress))
      throw new Error("Invalid contract address given");

    this.contractAddress = addressToHex(contractAddress);
    return this;
  }

  setOwnerAddress(address: string) {
    if (!isAddress(address))
      throw new Error("Invalid owner address given");

    this.ownerAddress = addressToHex(address);
    return this;
  }

  setFunctionSelector(functionSelector: string) {
    this.functionSelector = functionSelector;
    return this;
  }

  setFeeLimit(feeLimit: number) {
    if(!isInteger(feeLimit) || feeLimit <= 0 || feeLimit > 1_000_000_000)
      throw new Error('Invalid options.feeLimit provided');

    this.feeLimit = feeLimit;
    return this;
  }

  setParameters(parameters: any = {}) {
    this.parameters = parameters;
    return this;
  }

  setArguments(...parameters: any[]) {
    return this.setParameters(parameters);
  }

  setToken(tokenId: number, amount: number) {
    this.tokenId = tokenId;
    this.tokenAmount = amount;
    return this;
  }

  setTrxAmount(amount: number) {
    // @ts-ignore
    this.trxAmount = parseInt(amount);
    return this;
  }

  getInputTypes() {
    return getParamTypes(this.abi.inputs).map(type => {
      if (type == 'trcToken')
        return 'uint256';
      return type;
    });
  }

  /**
   * Build the parameters used to call a smart contract
   */
  buildParameterData() {

    if (this.parameters.length === 0)
      return '';

    const types = this.getInputTypes();

    const values = this.parameters.map((value, index) => {
      const type = types[index];

      if (type == 'address')
        return addressToSmartContractHex(value);

      return value;
    });


    const abiCoder = new Ethers.utils.AbiCoder();
    return abiCoder.encode(types, values).replace(/^(0x)/, '');
  }

  /**
   * Reads the result of a smart contract call
   */
  readResult(constantResult: string) {

    if (!this.abi)
      throw new Error(`Missing method abi for ${this.functionSelector}`);

    return this.abi.getOutputResult(constantResult);
  }
}
