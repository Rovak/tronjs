import {tronWeb} from "./network";

export async function timeLeft({ timestamp }) {
  const currentBlock = await tronWeb.trx.getCurrentBlock();
  return Math.floor(currentBlock.block_header.raw_data.timestamp / 100) - timestamp;
}
