import {tronWeb} from "../network";
import {getAccount, getBlock, getContract, getToken, mapTransaction} from "../utils";
import {toUtf8} from "@trx/core/dist/utils";
import {addressFromHex} from "@trx/core/dist/utils/address";

export async function account(parent, args) {
  return await getAccount(args.address);
}

export async function contract(parent, { address }) {
  return await getContract(address);
}

export async function transaction(parent, { id }) {
  const tx = await tronWeb.trx.getTransaction(id);
  const contract = tx.raw_data.contract[0];
  return {
    id: tx.txID,
    contract: {
      type: contract.type,
      parametersRaw: contract.parameter.value,
    }
  }
}

export async function proposal(parent, args) {
  const proposal = await tronWeb.trx.getProposal(args.id);
  return {
    id: proposal.proposal_id,
    address: proposal.proposer_address,
    approvals: proposal.approvals.map(approval => ({
      address: addressFromHex(approval),
    })),
  }
}

export async function proposals(parent, args) {
  const proposals = await tronWeb.trx.listProposals();
  return proposals.map(proposal => ({
    id: proposal.proposal_id,
    address: proposal.proposer_address,
    approvals: proposal.approvals.map(approval => ({
      address: addressFromHex(approval),
    }))
  }));
}

export async function exchange(parent, { id }) {
  const exchange = await tronWeb.trx.getExchangeByID(id);
  return {
    id: exchange.exchange_id,
    creatorAddress: addressFromHex(exchange.creator_address),
    firstTokenBalance: exchange.first_token_balance,
    secondTokenBalance: exchange.second_token_balance,
    firstTokenId: toUtf8(exchange.first_token_id),
    secondTokenId: toUtf8(exchange.second_token_id),
  }
}

export async function witnesses(parent, args) {
  const witnesses = await tronWeb.trx.listSuperRepresentatives();
  return witnesses.map(witness => ({
    address: witness.address,
    votes: witness.voteCount,
    blocksProduced: witness.totalProduced,
    latestBlock: witness.latestBlockNum,
    url: witness.url,
  }))
}

export async function block(parent, { number }) {
  return await getBlock(number);
}

export async function blocks(parent, { from, to }) {
  const blocks = await tronWeb.trx.getBlockRange(parseInt(from), parseInt(to));
  return blocks.map(block => ({
    id: block.blockID,
    number: block.block_header.raw_data.number,
  }));
}

export async function nodes(parent, args) {
  const nodes = await tronWeb.trx.listNodes();
  return nodes.map(node => {
    const [host, port] = node.split(':');

    return {
      host,
      port,
    }
  })
}

export async function token(parent, args) {
  return await getToken(args.id);
}

export async function nextRound() {
  const timeRemaining = await tronWeb.trx.timeUntilNextVoteCycle();
  return {
    timestamp: timeRemaining,
  }
}
