

export interface EventLog {
  contract: string;
  name: string;
  index: number;
  result: { [key: string]: string };
  resourceNode: string;
}
