import HttpApi from "@trx/core/dist/clients/http";
import {GetNowBlockJSON} from "@trx/core/dist/clients/http/types";
import {addressToHex} from "@trx/core/dist/utils/address";
import ContractAbi from "@trx/core/dist/smartcontract/contractAbi";
import xhr from "axios";
import RedisKeyValue from "../infrastructure/redis/keyValue";
import RedisPubSub from "../infrastructure/redis/pubsub";

const BLOCK_TIME = 3000;

export default class Importer {


  protected contracts: { [key: string]: any };

  private api: HttpApi;

  private pubSub: RedisPubSub;
  private keyValue: RedisKeyValue;

  constructor(redis) {
    this.contracts = {};

    this.api = new HttpApi('https://api.trongrid.io');
    this.pubSub = new RedisPubSub(redis);
    this.keyValue = new RedisKeyValue(redis);
  }

  async getContract(address: string): Promise<ContractAbi> {

    if (!this.contracts[address]) {

      const cachedContract = await this.keyValue.getOrElse("contract", address, async () => {
        const { data } = await xhr.get(`${this.api.getUrl()}/wallet/getcontract?value=${addressToHex(address)}`);
        return data;
      });

      this.contracts[address] = new ContractAbi(cachedContract.abi.entrys, cachedContract.name);
    }

    return this.contracts[address];
  }

  async parseBlock(block: GetNowBlockJSON): Promise<void> {

    const blockNumber = block.block_header.raw_data.number;

    await Promise.all(block.transactions.map(async transaction => {

      this.pubSub.publish("full:transaction", transaction);

      try {

        switch (transaction.raw_data.contract[0].type) {
          case "TriggerSmartContract":
            const contract = await this.getContract(transaction.raw_data.contract[0].parameter.value.contract_address);
            const scInputs = contract.decodeInput(transaction.raw_data.contract[0].parameter.value.data);

            break;

          case "TransferAssetContract":
            break;

          case "TransferContract":
            break;

          default:
            // console.log("type " + transaction.raw_data.contract[0].type);
            break;
        }

      } catch (e) {
        // console.log("tx", transaction.txID, this.transactionSave[transaction.txID], block.block_header.raw_data.number);
        // console.log(block.block_header.raw_data.number);
        console.error(e.toString());
      }
    }));
  }

  async startMaster() {

    const currentBlock = await this.api.getNowBlock();
    let blockNumber = currentBlock.block_header.raw_data.number;

    while (true) {

      const start = Date.now();

      try {

        const block = await this.api.getBlockByNum(blockNumber);
        await this.keyValue.save("block", blockNumber, block);

        this.pubSub.pushJob("full:block", block);

        blockNumber++;

      } catch (e) {
        console.log("parse error", e);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (Date.now() - start < BLOCK_TIME) {
        console.log("waiting", BLOCK_TIME - (Date.now() - start));
        await new Promise(resolve => setTimeout(resolve, BLOCK_TIME - (Date.now() - start)));
      }
    }
  }

  async startSlave() {
    this.pubSub.onJob("full:block").subscribe((block: GetNowBlockJSON) => {
      console.log(`Slave ${process.pid} handling ${block.block_header.raw_data.number}`);
      this.parseBlock(block);
    });
  }

}
