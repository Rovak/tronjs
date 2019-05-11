import xhr from "axios";
import {getAccountNet} from "./utils";

export function net({ address }) {
  return getAccountNet(address);
}

export function balance({ address, balance, _trc10Balances }) {
  return {
    trx: balance,
    _trc10Balances,
    address
  };
}

export async function  transactions({ address  }, { limit = 50, start = 0 }) {
  const { data: { data } } = await xhr.get(`https://apilist.tronscan.org/api/transaction?limit=${limit}&start=${start}&address=${address}`);
  return data;
}
