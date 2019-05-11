import {getAccount} from "./utils";

export function proposer({ address }) {
  return getAccount(address);
}
