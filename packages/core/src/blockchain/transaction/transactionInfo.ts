import {toUtf8} from "../../utils";
import {EventLog} from "./api";
import TransactionReceipt from "./receipt";

export default class TransactionInfo {

  id: string;
  block: number;
  fee: number;
  resultMessage: string;
  result: string;

  public readonly receipt: TransactionReceipt = null;

  public readonly contractAddress: string;

  eventLog: EventLog[];

  constructor(config: {[key: string]: any } = {}) {

    for (let [name, value] of Object.entries(config)) {

      switch (name) {
        case "id":
          this.id = value;
          break;
        case "block":
        case "blockNumber":
          this.block = value;
          break;
        case "fee":
          this.fee = value;
          break;
        case "resMessage":
          this.resultMessage = toUtf8(value);
          break;
        case "result":
          this.result = value;
          break;
        case "contract_address":
          this.contractAddress = value;
          break;
        case "receipt":
          this.receipt = TransactionReceipt.fromJson(value);
          break;
      }
    }

    this.eventLog = [];
  }

  setEventLog(eventLog: EventLog[]) {
    this.eventLog = eventLog;
  }

  getEventLog(): EventLog[] {
    return this.eventLog;
  }
}
