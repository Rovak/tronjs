import {PubSub} from 'apollo-server';
import TronWeb from "tronweb";
import xhr from "axios";
import {find} from "lodash";
import {GraphQLScalarType} from "graphql";
import {getNetwork, tronWeb} from "./network";
import {toUtf8} from "@trx/core/utils";
import {addressFromHex} from "@trx/core/utils/address";

export function buildTronWeb(privateKey) {

  const network = getNetwork();
  return new TronWeb(
    network,
    network,
    network,
    privateKey,
  );
}

export async function getResult(txResult) {
  const { result, transaction: { txID: hash } } = await txResult;

  return {
    result,
    hash,
  };
}

export async function runTx(tx) {
  const signedTransaction = await tronWeb.trx.sign(await tx);
  return getResult(tronWeb.trx.sendRawTransaction(signedTransaction));
}

export async function runTwTx(tronWeb, tx) {
  const signedTransaction = await tronWeb.trx.sign(await tx);
  return getResult(tronWeb.trx.sendRawTransaction(signedTransaction));
}

const pubsub = new PubSub();

const CONTRACT_EVENT = 'CONTRACT_EVENT';


let id = 1;

setInterval(() => {
  pubsub.publish(CONTRACT_EVENT, {
    contractEvent: {
      contract: "TEST",
      index: id++,
    }
  });
}, 3000);

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.

export async function getAccount(address) {
  const account = await tronWeb.trx.getUnconfirmedAccount(address);
  return {
    _trc10Balances: account.assetV2,
    name: account.account_name ? toUtf8(account.account_name) : "",
    address: addressFromHex(account.address),
    addressHex: account.address,
    balance: account.balance,
    isWitness: account.is_witness,
    dateCreated: account.create_time,
    frozenBalance: (account.frozen || []).map(frozen => ({
      balance: frozen.frozen_balance,
      expires: frozen.expire_time,
    }))
  }
}

export async function getAccountNet(address) {
  const net = await tronWeb.trx.getAccountResources(address);
  return {
    freeBandwidthUsed: net.freeNetUsed || 0,
    freeBandwidthLimit: net.freeNetLimit,
    bandwidthUsed: net.NetUsed,
    bandwidthLimit: net.NetLimit,
  }
}

export async function getBlock(number) {
  const block = await tronWeb.trx.getBlockByNumber(number);
  return {
    id: block.blockID,
    number: block.block_header.raw_data.number,
  }
}

export async function getContract(address) {
  const { data }: any = await xhr.get(`${tronWeb.fullNode.host}/wallet/getcontract?value=${TronWeb.address.toHex(address)}`);

  return {
    originAddress: addressFromHex(data.origin_address),
    address,
    bytecode: data.bytecode,
    userResourcePercentage: data.consume_user_resource_percent || 0,
  }
}


export async function getInfo(id) {
  const tx = await tronWeb.trx.getTransactionInfo(id);
  return {
    blockNumber: tx.blockNumber,
    blockTimestamp: tx.blockTimeStamp,
    fee: tx.fee || 0,
    receipt: {
      energyUsage: tx.receipt.origin_energy_usage,
      energyUsageTotal: tx.receipt.energy_usage_total,
      bandwidthUsage: tx.receipt.net_usage || tx.receipt.net_fee,
      bandwidthFee: tx.receipt.net_fee,
      result: tx.receipt.result,
    },
  }
}

export async function getToken(id) {
  const { data: token } = await xhr.get(`${tronWeb.fullNode.host}/wallet/getassetissuebyid?value=${id}`);
  return {
    id: token.id,
    // ownerAddress: addressFromHex(token.owner_address),
    decimals: token.precision || 0,
    name: toUtf8(token.name),
    shortName: toUtf8(token.abbr),
    totalSupply: token.total_supply,
    trxNum: token.trx_num,
    num: token.num,
    description: toUtf8(token.description),
    url: toUtf8(token.url),
  }
}

export function waitFor(timeout) {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

export const trc20Contracts = {};
export const contracts = {};
export const trc10Tokens = {};

export async function getContractObj(tw, contractAddress) {
  if (!contracts[contractAddress]) {
    contracts[contractAddress] = await tw.contract().at(contractAddress);
  }

  return contracts[contractAddress];
}

const simpleMemoryCache = {};


export function cache(func, idSelector = null) {
  return async (parentObj, args, context, info) => {

    let cacheKey = `${info.parentType}-${info.fieldName}`;

    if (idSelector !== null) {

      let idValue = idSelector({ obj: parentObj, args });

      cacheKey += `-${idValue}`;
    } else if (!info.parentType || info.parentType !== 'Query') {
      const parentFields = info.schema.getType(info.parentType).getFields();
      const idFieldName = find(Object.values(parentFields), (f: any) => f.type.toString() === 'ID');
      const idValue = parentObj[idFieldName.name];
      cacheKey += `-${idValue}`;
    }

    if (!simpleMemoryCache[cacheKey]) {
      simpleMemoryCache[cacheKey] = await func(parentObj, args, context, info);
    }

    // console.log("cache", cacheKey, info.parentType);

    return simpleMemoryCache[cacheKey];
  };
}

export function cacheQuery(idFunc = null) {
  return func => {
    return cache(func, idFunc);
  }
}

export function addCache(resolvers, cache) {
  const cachedResolvers = {};

  for (let [typeObj, fieldResolvers] of Object.entries(resolvers)) {
    let newTypeResolvers = {};

    if (fieldResolvers instanceof GraphQLScalarType) {
      newTypeResolvers[typeObj] = fieldResolvers;
    } else {
      for (let [resolverName, resolverFunc] of Object.entries(fieldResolvers)) {
        newTypeResolvers[resolverName] = resolverFunc;
        if (typeof resolverFunc == 'function' && cache[typeObj] && cache[typeObj][resolverName]) {
          newTypeResolvers[resolverName] = cache[typeObj][resolverName](resolverFunc);
        }
      }
    }

    cachedResolvers[typeObj] = newTypeResolvers
  }

  return cachedResolvers;
}
