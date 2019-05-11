import {getAccount} from "./utils";

export function account({ address }) {
  return getAccount(address);
}
