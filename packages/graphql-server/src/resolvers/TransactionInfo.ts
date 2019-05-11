import {getBlock} from "./utils";

export function block({ blockNumber }) {
  return getBlock(blockNumber);
}
