export default class Transaction {

  id: string;
  contractData: { [key: string]: any } = {};
  contractType: string;
  contractInput: any;

  constructor(config: {[key: string]: any } = {}) {

    for (let [name, value] of Object.entries(config)) {

      switch (name) {
        case "id":
          this.id = value;
          break;
        case "raw_data":
          this.contractData = value.contract[0].parameter.value;
          this.contractType = value.contract[0].type;
          break;
      }
    }
  }

  getCallValue(): number {
    if (!this.contractData) {
      return 0;
    }

    return this.contractData.call_value || 0;
  }

  getContractType(): string {
    return this.contractType;
  }

  setContractInput(input: any) {
    this.contractInput = input;
  }

  public static fromJson(json) {
    return new Transaction(json);
  }
}
