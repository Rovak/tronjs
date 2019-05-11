export interface AbiEntry {
  name: string;
  stateMutability: string;
  type: string;
  inputs?: EntryInput[];
  outputs?: EntryOutput[];
  constant?: boolean;
}

export interface EntryOutput {
  type: string;
}


export interface EntryInput {
  type: string;
  name: string;
  indexed?: boolean;
}
