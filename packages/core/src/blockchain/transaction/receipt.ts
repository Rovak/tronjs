export default class TransactionReceipt {

  energyFee: number;
  energyUsed: number;
  energyUsedTotal: number;
  bandwidthUsed: number;
  result: string;


  constructor(config: {[key: string]: any } = {}) {

    for (let [name, value] of Object.entries(config)) {

      switch (name) {
        case "result":                this.result = value;           break;
        case "energy_fee":            this.energyFee = value;        break;
        case "energy_usage":          this.energyUsed = value;       break;
        case "energy_usage_total":    this.energyUsedTotal = value;  break;
        case "net_usage":             this.bandwidthUsed = value;    break;
      }
    }
  }

  public static fromJson(json) {
    return new TransactionReceipt(json);
  }
}
