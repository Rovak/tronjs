import {buildTronWeb} from "../utils";

export async function trc10Transfer(parent, { privateKey, to, tokenId, amount }) {
  const tronWeb = buildTronWeb(privateKey);
  return await tronWeb.trx.sendToken(to, amount, tokenId);
}
