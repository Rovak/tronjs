import {tronWeb} from "./network";
import xhr from "axios";
import {find} from "lodash";
import {getContractObj, trc10Tokens, trc20Contracts} from "./utils";
import {toUtf8} from "@trx/core/dist/utils";
import {addressFromHex} from "@trx/core/dist/utils/address";

export async function trc20({ address }, { address: contractAddress }) {
  if (!trc20Contracts[contractAddress]) {
    trc20Contracts[contractAddress] = await getContractObj(tronWeb, contractAddress);
  }

  return {
    address: contractAddress,
    ownerAddress: address,
    contractObj: trc20Contracts[contractAddress],
  };
}

export async function trc10({ address, _trc10Balances }, { id }) {
  if (!trc10Tokens[id]) {
    const { data: tokenData } = await xhr.get(`${tronWeb.fullNode.host}/wallet/getassetissuebyid?value=${id}`);
    trc10Tokens[id] = tokenData;
  }

  const token = trc10Tokens[id];
  const accountToken = find(_trc10Balances, asset => asset.key === id.toString());
  const balance = accountToken ? accountToken.value : 0;

  return {
    id,
    _accountAddress: address,
    balanceSun: accountToken ? accountToken.value : 0,
    balance: balance / Math.pow(10, token.precision || 0),
    address: addressFromHex(token.owner_address),
    totalSupply: token.total_supply,
    name: toUtf8(token.name),
    decimals: token.precision || 0,
    symbol: toUtf8(token.abbr),
  };
}
