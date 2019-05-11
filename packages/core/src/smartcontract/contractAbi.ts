import MethodAbi from "./methodAbi";
import {find, filter} from "lodash";
import {AbiEntry} from "./abi";
import ContractApi from "./contractApi";
import EventAbi from "./eventAbi";

export default class ContractAbi {

  /**
   * Name of the smart contract
   */
  readonly name: string;

  /**
   * Abi
   */
  readonly abi: AbiEntry[];

  /**
   * Method ABI instances
   */
  public methods: { [key: string]: MethodAbi };

  /**
   * Method list
   */
  public methodList: MethodAbi[] = [];

  /**
   * Method ABI instances
   */
  public events: { [key: string]: EventAbi };


  /**
   * Events list
   */
  public eventList: EventAbi[] = [];

  constructor(abi, name = 'Unknown') {
    this.abi = abi;
    this.name = name;
    this.methods = {};
    this.events = {};
    this.loadAbi(abi);
  }

  private loadAbi(abi: AbiEntry[]) {

    for (let abiEntry of abi) {
      if (abiEntry.type === 'Function') {
        const method = new MethodAbi(abiEntry);

        this.methodList.push(method);

        this.methods = {
          ...this.methods,
          ...method.getIds(),
        };

      } else if (abiEntry.type === 'Event') {
        const event = new EventAbi(abiEntry);
        this.eventList.push(event);
        this.events = {
          ...this.events,
          ...event.getIds(),
        };
      }
    }
  }

  /**
   * Retrieve MethodAbi
   */
  public getMethods(): MethodAbi[] {
    return this.methodList;
  }

  /**
   * Retrieve method by name
   *
   * @param name
   */
  public getMethod(name: string): MethodAbi {
    return this.methods[name];
  }

  /**
   * If the contract has a constructor defined
   */
  hasConstructor(): boolean {
    return !!this.getConstructorMethod();
  }

  /**
   * Returns the constructor method if any is defined
   */
  getConstructorMethod() {
    return find(this.abi, func => func.type.toLowerCase() === 'constructor');
  }

  /**
   * Retrieve all entries which are marked as an event
   */
  getEvents() {
    return this.eventList;
  }

  buildApi(address: string) {
    return new ContractApi(this, address);
  }

  /**
   * Decode the data string from a smart contract event
   */
  decodeInput(data: string) {

    const methodName = data.substring(0, 8);
    const inputData = data.substring(8);

    if (!this.methods[methodName])
      throw new Error(`Contract method ${methodName} not found`);

    const methodInstance = this.methods[methodName];

    return {
      name: methodInstance.name,
      params: this.methods[methodName].getInputResult(inputData),
    }
  }

}
