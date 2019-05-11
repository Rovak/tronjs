import MethodAbi from "./methodAbi";
import {getParamTypes} from "../utils/abi";
import {prepareInputArguments} from "./utils";
import ContractApi from "./contractApi";
import MethodCall from "./methodCall";


export default class MethodApi {

  public readonly abi: MethodAbi;
  private contract: ContractApi;

  constructor(methodAbi: MethodAbi, contractApi: ContractApi) {
    this.abi = methodAbi;
    this.contract = contractApi;
  }

  onMethod(...args) {
    const types = getParamTypes(this.abi.inputs);

    args = prepareInputArguments(args, types);

    return {
      call: (...methodArgs) => this._call(types, args, ...methodArgs),
    }
  }

  build(options: any = {}) {
    return new MethodCall({
      abi: this.abi,
      contractAddress: this.contract.address,
      functionSelector: this.abi.functionSelector,
      ...options,
    });
  }

  async _call(types, args, options: any = {}) {

    if (types.length !== args.length)
      throw new Error('Invalid argument count provided');

    if (!this.contract.address)
      throw new Error('Smart contract is missing address');

    const {stateMutability} = this.abi;

    if (!this.abi.isConstant())
      throw new Error(`Methods with state mutability "${stateMutability}" must use send()`);

    let parameters = args.map((value, index) => ({
      type: types[index],
      value
    }));

    return new MethodCall({
      abi: this.abi,
      contractAddress: this.contract.address,
      ownerAddress: options.issuerAddress,
      functionSelector: this.abi.functionSelector,
      parameters,
      feeLimit: options.feeLimit,
      trxAmount: options.callValue,
      token: {
        id: options.tokenId,
        amount: options.tokenValue,
      },
    });
  }

}
