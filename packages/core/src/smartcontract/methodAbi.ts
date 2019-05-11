import {sha3} from "../utils/crypto";
import {decodeOutput, getFunctionSelector} from "../utils/abi";
import {parseResultData} from "./utils";
import {AbiEntry} from "./abi";

export default class MethodAbi {

  private abi;
  readonly name: string;
  readonly functionSelector: string;
  readonly signature: string;

  public readonly stateMutability: string;

  public readonly inputs: any[];
  public readonly inputTypes: { [key: string]: string };
  public readonly outputTypes: { [key: string]: string };
  public readonly outputs: any[];
  public readonly type: string;

  constructor(abi: AbiEntry) {
    this.abi = abi;
    this.type = abi.type;
    this.name = abi.name;

    this.inputs = abi.inputs || [];
    this.outputs = abi.outputs || [];
    this.stateMutability = abi.stateMutability.toLowerCase();

    this.inputTypes = this.inputs.reduce((map, {name, type}) => ({
      ...map,
      [name]: type,
    }), {});

    this.outputTypes = this.outputs.reduce((map, {name, type}) => ({
      ...map,
      [name]: type,
    }), {});

    this.functionSelector = getFunctionSelector(abi);
    this.signature = sha3(this.functionSelector, false); //.slice(0, 8);
  }

  /**
   * Get IDs for this method
   */
  getIds(): { [key: string]: MethodAbi } {
    return {
      [this.name]: this,
      [this.functionSelector]: this,
      [this.signature]: this,
      [this.signature.slice(0, 8)]: this,
    }
  };

  /**
   * Retrieve indexed inputs
   */
  getIndexedInputs() {
    return this.inputs.filter(x => !!x.indexed);
  }
  /**
   * Retrieve indexed inputs
   */
  getInputs() {
    return this.inputs;
  }

  hasInput() {
    return this.inputs.length > 0;
  }

  decodeInput(data) {
    return decodeOutput(this.inputs, '0x' + data);
  }

  getInputResult(data: string) {
    return parseResultData(decodeOutput(this.inputs, '0x' + data, true), this.inputTypes);
  }

  getOutputResult(data: string) {
    return parseResultData(decodeOutput(this.outputs, '0x' + data, true), this.outputTypes);
  }

  parseNonIndexedData(data) {
    const inputs = this.inputs.filter(x => !x.indexed);
    return parseResultData(decodeOutput(inputs, '0x' + data, true), this.inputTypes);
  }

  isPayable() {
    return this.stateMutability === 'payable';
  }

  isView() {
    return this.stateMutability === 'view';
  }

  isPure() {
    return this.stateMutability === 'pure';
  }

  /**
   * If the method is a call that does not require a blockchain transactions
   */
  isConstant() {
    return this.isPure() || this.isView();
  }
}
