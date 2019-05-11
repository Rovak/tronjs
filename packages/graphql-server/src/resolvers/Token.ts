import {getAccount} from "./utils";

export function owner({ ownerAddress }) {
  return getAccount(ownerAddress);
}
