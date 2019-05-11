import ContractAbi from "../../smartcontract/contractAbi";
import xhr from "axios";
import {addressToHex} from "../../utils/address";
import {MAINNET_API} from "../../constants";

/**
 * Loads contracts with internal cache
 */
export default class ContractLoader {

  private readonly apiUrl: string;
  private readonly cache: { [key: string]: ContractAbi };

  constructor(apiUrl: string = MAINNET_API) {
    this.apiUrl = apiUrl;
    this.cache = {};
  }

  /**
   * Load a contract
   *
   * @param contractAddress contractAddress in base58 or hex
   */
  public async load(contractAddress: string): Promise<ContractAbi> {
    contractAddress = addressToHex(contractAddress);
    const { data: { abi, name } } = await xhr.get(`${this.apiUrl}/wallet/getcontract?value=${contractAddress}`);
    if (!abi)
      throw new Error("Contract not found");

    return new ContractAbi(abi.entrys, name);
  }

  /**
   * Retrieve a (cached) contract
   *
   * @param contractAddress contractAddress in base58 or hex
   */
  public async get(contractAddress: string): Promise<ContractAbi> {
    contractAddress = addressToHex(contractAddress);
    if (!this.cache[contractAddress]) {
      this.cache[contractAddress] = await this.load(contractAddress);
    }

    return this.cache[contractAddress];
  }

  /**
   * Retrieve a (cached) contract
   *
   * @param contractAddress contractAddress in base58 or hex
   */
  public async getApi(contractAddress: string): Promise<any> {
    const abi = await this.get(contractAddress);

    return abi.buildApi(contractAddress);
  }
}
