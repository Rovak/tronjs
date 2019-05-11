export interface Block {
  number: number;
}

export interface Transaction {
  hash: string;
}

export interface Account {
  address: string;
  balance: number;
}
