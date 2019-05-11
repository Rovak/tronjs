import ContractAbi from "./contractAbi";
import MethodApi from "./methodApi";
import MethodAbi from "./methodAbi";


export default class ContractApi {
  public abi: ContractAbi;
  public readonly address: string;
  private methodApis: { [key: string]: MethodApi }


  constructor(contractAbi: ContractAbi, address: string) {
    this.abi = contractAbi;
    this.address = address;
    this.methodApis = {};
    this._buildApi();
  }

  private _buildApi() {
    for (let method of this.abi.getMethods()) {

      const methodApi = new MethodApi(method, this);
      const methodCall = methodApi.onMethod.bind(methodApi);

      for (let methodName of Object.keys(method.getIds())) {
        this[methodName] = methodCall;
        this.methodApis[methodName] = methodApi;
      }
    }
  }

  public getMethod(name: string): MethodApi {
    return this.methodApis[name];
  }
}
