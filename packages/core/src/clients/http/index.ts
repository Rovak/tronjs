import ContractLoader from "./contractLoader";
import xhr from "axios";
import TransactionInfo from "../../blockchain/transaction/transactionInfo";
import {addressToHex} from "../../utils/address";
import {find} from "lodash";
import {generate, of} from "rxjs";
import {concatMap, delay, map, retryWhen, takeWhile, tap} from "rxjs/operators";
import {AccountType} from "../../blockchain/types";
import {decodeOutput} from "../../utils/abi";
import {Log} from "./types";
import {EventLog} from "../../blockchain/transaction/api";
import Transaction from "../../blockchain/transaction/transaction";
import {MAINNET_API} from "../../constants";
import ContractAbi from "../../smartcontract/contractAbi";
import ContractApi from "../../smartcontract/contractApi";

export default class HttpApi {

  private readonly url: string;
  private contractLoader: ContractLoader;

  constructor(url: string = MAINNET_API) {
    this.url = url;
    this.contractLoader = new ContractLoader(url);
  }

  getUrl() {
    return this.url;
  }

  /**
   * Retrieve TransactionInfo for the given address
   *
   * @param txHash {string} Transaction hash
   */
  async findTransactionInfoByHash(txHash: string) {
    const {data} = await xhr.get(`${this.getUrl()}/wallet/gettransactioninfobyid?value=${txHash}`);

    // console.log("looking up", txHash);

    if (Object.keys(data).length === 0) {
      return null;
    }

    const transaction = new TransactionInfo({
      ...data,
    });

    try {
      if (data.contract_address) {
        if (data.log) {
          const events = await this.parseLog(data.log);
          transaction.setEventLog(events);
        }
      }
    } catch (e) {
      console.error(e);
    }

    return transaction;
  }

  /**
   * Retrieve Transaction for the given address
   *
   * @param txHash {string} Transaction hash
   */
  async findTransactionByHash(txHash: string) {
    const {data} = await xhr.get(`${this.getUrl()}/wallet/gettransactionbyid?value=${txHash}`);


    if (Object.keys(data).length === 0) {
      return null;
    }

    return Transaction.fromJson(data);
  }

  /**
   * Retrieve smart contract input data from a transaction
   * @param transaction
   */
  async getSmartContractInputFromTransaction(transaction: Transaction) {

    if (transaction.getContractType() === 'TriggerSmartContract') {
      const contractAbi = await this.getContractAbi(transaction.contractData.contract_address);
      return contractAbi.decodeInput(transaction.contractData.data);
    }

    return null;
  }

  /**
   * Retrieves the current block
   */
  async getNowBlock() {
    const {data} = await xhr.get(`${this.getUrl()}/wallet/getnowblock`, {
      timeout: 5000
    });

    return data;
  }

  /**
   * Retrieves the current block
   */
  async getBlockByNum(num: number) {
    const {data, request} = await xhr.get(`${this.getUrl()}/wallet/getblockbynum?num=${num}`, {
      timeout: 5000
    });

    if (Object.keys(data).length === 0) {
      console.error(data, request);
      throw new Error("invalid data");
    }

    return data;
  }
  /**
   * Retrieves the current block
   */
  async getBlockRange(from: number, to: number) {
    const {data: { block }} = await xhr.get(`${this.getUrl()}/wallet/getblockbylimitnext?startNum=${from}&endNum=${to}`, {
      timeout: 5000
    });

    return block;
  }

  /**
   * Parse log
   */
  async parseLog(log: Log[]): Promise<EventLog[]> {

    const events: EventLog[] = [];

    let eventIndex = 0;

    for (let event of log) {
      const contract = await this.contractLoader.get(`41${event.address}`);

      const methodSignature = find(event.topics, topic => !!contract.getMethod(topic));

      if (!methodSignature) {
        continue;
      }

      const method = contract.methods[methodSignature];

      try {

        let indexedParameters = method.getIndexedInputs();
        let topics = event.topics.slice(1);

        // Fallback for wrong abi
        if (indexedParameters.length !== topics.length) {
          indexedParameters = method.getInputs().slice(0, topics.length);
        }

        const indexedParameterValues = topics.map((topic, index) => ({
          topic,
          type: indexedParameters[index],
        }));

        // console.log("INDEXED PARAMETERS", indexedParameters, indexedParameterValues);

        const indexedParametersValues = indexedParameterValues.reduce((map, { topic, type }) => {
          return ({
            ...map,
            // [type.name]: decodeOutput([type], '0x' + (type.type === 'address' ? topic.slice(24) : topic))[type.name],
            [type.name]: decodeOutput([type], `0x${topic}`)[type.name],
          })
        }, {});

        // console.log("INDEXED PARAMETERS", indexedParametersValues);


        events.push({
          resourceNode: 'FullNode',
          contract: `41${event.address}`,
          name: method.name,
          index: eventIndex++,
          result: {
            ...method.parseNonIndexedData(event.data),
            ...indexedParametersValues,
          },
        });
      } catch(e) {
        console.error(e);
      }
    }

    return events;
  }

  findTransactionsFromAddress(address: string) {
    address = addressToHex(address);

    return generate(0, x => x < 999999, x => x + 1)
      .pipe(
        concatMap(page =>
          of(page)
            .pipe(
              concatMap(() =>
                xhr.post(`${this.getUrl()}/walletextension/gettransactionsfromthis`, {
                  account: {
                    address,
                  },
                  offset: 30 * page,
                  limit: 30,
                })
              ),
              retryWhen(errors =>
                errors.pipe(
                  tap(val => console.error(val)),
                  delay(5000)
                )
              ),
            )
        ),
        map(x => x.data.transaction),
        takeWhile(items => items.length > 0),
        concatMap(x => x),
      );
  }

  /**
   * Retrieve a contract
   *
   * @param address
   */
  getContractAbi(address: string): Promise<ContractAbi> {
    return this.contractLoader.get(address);
  }

  /**
   * Retrieve a contract
   *
   * @param address
   */
  getContract(address: string): Promise<ContractApi> {
    return this.contractLoader.getApi(address);
  }

  /**
   * Broadcast transaction
   */
  async broadcastTransaction(transaction: any) {
    const { data } = await xhr.post(`${this.getUrl()}/wallet/broadcasttransaction`, transaction);

    return data;
  }

  async getAccountType(address: string) {
    const {data} = await xhr.get(`${this.getUrl()}/wallet/getaccount?address=${addressToHex(address)}`);


    if (data.type === 'Contract') {
      return AccountType.Contract;
    }

    return AccountType.Wallet;
  }
}
