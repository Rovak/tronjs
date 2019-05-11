import TransactionCommand from "../../transaction/transactionCommand";
import TransactionBuilder from "../../transaction/transactionBuilder";
import MethodCall from "../../smartcontract/methodCall";
import {addressToHex} from "../../utils/address";
import {isNotNullOrUndefined, toUtf8} from "../../utils";
import xhr from "axios";
import HttpApi from "./index";
import TransactionSigner from "../../transaction/transactionSigner";
import PrivateKeyTransactionSigner from "../../transaction/privateKeyTransactionSigner";
import {hasProperty} from "../../utils/utils";
import {isUndefined} from "lodash";
import {parseResultMessage} from "../../smartcontract/utils";
import MethodCallResult from "../../smartcontract/methodCallResult";

export default class HttpTransactionBuilder implements TransactionBuilder {

  private api: HttpApi;
  private signer: TransactionSigner;

  constructor(api: HttpApi, signer: TransactionSigner) {
    this.api = api;
    this.signer = signer;
  }

  /**
   * Easy method to build a transaction builder with private key signer
   */
  static build(options): HttpTransactionBuilder {
    const api = new HttpApi(options.url);
    const signer = new PrivateKeyTransactionSigner(options.privateKey);

    return new HttpTransactionBuilder(api, signer);
  }

  /**
   * Handle a transaction command
   */
  async handleCommand(transactionCmd: Promise<TransactionCommand>): Promise<any> {

    const cmd = await transactionCmd;

    const methodName = `build${cmd.name}`;
    if (isUndefined(this[methodName]))
      throw new Error(`Unable to handle ${cmd.name}`);

    const request = await this[methodName](cmd);

    return await this.sign(request.transaction);
  }

  /**
   * Calls a smart contract
   */
  async callSmartContract(transactionCmd: Promise<MethodCall> | MethodCall): Promise<MethodCallResult> {

    const cmd: MethodCall = await transactionCmd;

    const request = await this.buildMethodCall(cmd);

    const callResult = new MethodCallResult();

    if (!cmd.abi.isConstant()) {
      const transaction = await this.sign(request.transaction);
      const broadcastedTransaction = await this.api.broadcastTransaction(transaction);
      callResult.setTransactionId(request.transaction.txID);
    } else {

      if (!hasProperty(request, 'constant_result')) {

        if (request.code === 'OTHER_ERROR') {
          throw new Error(toUtf8(request.message));
        }

        throw new Error('Failed to execute');
      }


      callResult.setTransactionId(request.txid);

      // Validates if the result is right, if not then throw an error
      callResult.setError(parseResultMessage(request.constant_result[0]));

      let output = cmd.readResult(request.constant_result[0]);
      if (output.length === 1)
        output = output[0];

      callResult.setResult(output);
    }

    return callResult;
  }

  /**
   * Signs the given transaction
   */
  async sign(transaction) {

    const signature = await this.signer.signHash(transaction.txID);

    return {
      ...transaction,
      signature: [signature],
    };
  }

  // noinspection JSUnusedGlobalSymbols
  private async buildMethodCall(methodCall: MethodCall) {

    let callValue = methodCall.trxAmount;
    let feeLimit = methodCall.feeLimit;

    let functionSelector = methodCall.functionSelector.replace('/\s*/g', '');

    const postArgs: any = {
      contract_address: addressToHex(methodCall.contractAddress),
      owner_address: addressToHex(methodCall.ownerAddress),
      function_selector: functionSelector,
      fee_limit: feeLimit,
      call_value: callValue,
      parameter: methodCall.buildParameterData()
    };

    if (isNotNullOrUndefined(methodCall.tokenAmount))
      postArgs.call_token_value = methodCall.tokenAmount;

    if (isNotNullOrUndefined(methodCall.tokenId))
      postArgs.token_id = methodCall.tokenId;

    const {data} = await xhr.post(`${this.api.getUrl()}/wallet/triggersmartcontract`, postArgs);

    return data;
  }

}
