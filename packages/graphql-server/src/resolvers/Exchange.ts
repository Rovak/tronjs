import {getAccount, getToken} from "./utils";

export function creator({ creatorAddress }) {
  return getAccount(creatorAddress);
}

export function firstToken({ firstTokenId }) {
  if (firstTokenId === '_') {
    return {
      name: 'TRX',
    };
  }

  return getToken(firstTokenId);
}

export function secondToken({ secondTokenId }) {
  if (secondTokenId === '_') {
    return {
      name: 'TRX',
    };
  }

  return getToken(secondTokenId);
}
