export default class Account {

  name: number;
  address: string;

  constructor(options: any = {}) {
    this.name = options.name;
    this.address = options.address;
  }
}
