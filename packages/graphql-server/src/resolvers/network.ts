import HttpApi from "@trx/core/clients/http";
import TronWeb from "tronweb";

export function getNetwork() {

  const network = process.env.NETWORK || '';

  switch (network.toLowerCase()) {
    case "testnet":
    case "test":
    case "shasta":
      return 'https://api.shasta.trongrid.io';

    case "guildchat":
      return 'https://super.guildchat.io';

    case "mainnet":
    case "main":
    default:
      return 'https://api.trongrid.io';
  }

}

export const network = getNetwork();

export const tronWeb = new TronWeb(
  network,
  network,
  network,
);

export const client = new HttpApi(tronWeb.fullNode.host);
