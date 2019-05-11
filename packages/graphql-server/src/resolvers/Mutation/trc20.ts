import {buildTronWeb, getContractObj} from "../utils";

export async function trc20Transfer(parent, { privateKey, contractAddress, to, amount }) {
  const tronWeb = buildTronWeb(privateKey);

  const contract = await getContractObj(tronWeb, contractAddress);

  const decimals = await contract.decimals();

  const sendAmount = parseInt(amount) * Math.pow(10, decimals.toNumber());

  const hash = await contract.transfer(to, amount).send();

  return {
    hash,
    success: true,
  };
}

export async function trc20Approve(parent, { privateKey, contractAddress, spender, amount }) {
  const tronWeb = buildTronWeb(privateKey);

  const contract = await getContractObj(tronWeb, contractAddress);

  const hash = await contract.approve(spender, amount).send();

  return {
    hash,
    success: true,
  };
}
