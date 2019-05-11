import TronWeb from "tronweb";
import {buildTronWeb, getResult, runTwTx, runTx} from "../utils";

export async function trxTransfer(parent, { privateKey, to, amount }) {
  const tronWeb = buildTronWeb(privateKey);
  return await getResult(tronWeb.trx.sendTransaction(to, amount));
}

export async function generateWallet() {
  const account = await TronWeb.createAccount();

  return {
    address: account.address.base58,
    addressHex: account.address.hex,
    privateKey: account.privateKey,
  };
}

export async function updateAccount(parent, { privateKey, name }) {
  return await getResult(buildTronWeb(privateKey).trx.updateAccount(name));
}

export async function updateSmartContractUserResourceConsumption(parent, { privateKey, contractAddress, percentage }) {
  const tronWeb = await buildTronWeb(privateKey);
  return await runTwTx(tronWeb, tronWeb.transactionBuilder.updateSetting(contractAddress, percentage));
}

export async function updateSmartContractEnergyLimit(parent, { privateKey, contractAddress, limit }) {
  return await runTx(await buildTronWeb(privateKey).transactionBuilder.updateEnergyLimit(contractAddress, limit));
}

export async function vote(parent, { privateKey, votes = [] }) {
  const tronWeb = buildTronWeb(privateKey);

  let voteMap = {};

  for (let vote of votes) {
    voteMap[vote.address] = vote.votes;
  }

  return await runTwTx(tronWeb, tronWeb.transactionBuilder.vote(voteMap));
}

export async function withdrawRewards(parent, { privateKey }) {
  return await runTx(buildTronWeb(privateKey).transactionBuilder.withdrawBlockRewards());
}

export async function unfreezeBalance(parent, { privateKey, resource = "BANDWIDTH", receiverAddress = undefined }) {
  const tronWeb = buildTronWeb(privateKey);
  return await getResult(tronWeb.trx.unfreezeBalance(resource, tronWeb.defaultAddress.hex, receiverAddress));
}

export async function freezeBalance(parent, { privateKey, resource = "BANDWIDTH", amount, duration = 3, receiverAddress = undefined }) {
  return await getResult(buildTronWeb(privateKey).trx.freezeBalance(amount, duration, resource, receiverAddress));
}

export async function purchaseToken(parent, { privateKey, issuerAddress, tokenId, amount }) {
  return await runTx(buildTronWeb(privateKey).transactionBuilder.purchaseToken(issuerAddress, tokenId, amount));
}

export async function applyForSuperRepresentative(parent, { privateKey, url }) {
  const tronWeb = buildTronWeb(privateKey);
  return await runTwTx(tronWeb, tronWeb.transactionBuilder.applyForSR(tronWeb.defaultAddress.hex, url));
}

export async function createProposal(parent, { privateKey, parameters }) {
  const tronWeb = buildTronWeb(privateKey);
  return await runTwTx(tronWeb, tronWeb.transactionBuilder.createProposal(parameters.map(parameter => ({ key: parameter.id, value: parameter.value }))));
}

export async function deleteProposal(parent, { privateKey, id }) {
  const tronWeb = buildTronWeb(privateKey);
  return await runTwTx(tronWeb, tronWeb.transactionBuilder.deleteProposal(id));
}

export async function voteProposal(parent, { privateKey, id, approved }) {
  const tronWeb = buildTronWeb(privateKey);
  return await runTwTx(tronWeb, tronWeb.transactionBuilder.voteProposal(id, approved));
}

export async function createTRXExchange(parent, { privateKey, tokenName, tokenBalance, trxBalance }) {
  const tronWeb = buildTronWeb(privateKey);
  return await runTwTx(tronWeb, tronWeb.transactionBuilder.createTRXExchange(tokenName, tokenBalance, trxBalance));
}

export async function createTokenExchange(parent, { privateKey, firstTokenName, firstTokenBalance, secondTokenName, secondTokenBalance }) {
  const tronWeb = buildTronWeb(privateKey);
  return await runTwTx(tronWeb, tronWeb.transactionBuilder.createTokenExchange(firstTokenName, firstTokenBalance, secondTokenName, secondTokenBalance));
}

export async function injectExchangeTokens(parent, { privateKey, id = false, tokenName = false, tokenAmount = 0 }) {
  const tronWeb = buildTronWeb(privateKey);
  return await runTwTx(tronWeb, tronWeb.transactionBuilder.injectExchangeTokens(id, tokenName, tokenAmount));
}

export async function withdrawExchangeTokens(parent, { privateKey, id = false, tokenName = false, tokenAmount = 0 }) {
  const tronWeb = buildTronWeb(privateKey);
  return await runTwTx(tronWeb, tronWeb.transactionBuilder.withdrawExchangeTokens(id, tokenName, tokenAmount));
}

export async function updateToken(parent, { privateKey, description = false, url = false, freeBandwidth = 0, freeBandwidthLimit = 0 }) {
  const tronWeb = buildTronWeb(privateKey);
  return await runTwTx(tronWeb, tronWeb.transactionBuilder.updateToken({
    description,
    url,
    freeBandwidth,
    freeBandwidthLimit,
  }));
}
