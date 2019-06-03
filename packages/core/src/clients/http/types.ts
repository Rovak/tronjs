
export interface Log {
  address: string;
  topics: string[];
  data: string;
}

export interface TransactionJSON {
  raw_data: any;
  txID: string;
}

export interface GetNowBlockJSON {
  blockID: string;
  transactions: TransactionJSON[];
  block_header: any;
}
