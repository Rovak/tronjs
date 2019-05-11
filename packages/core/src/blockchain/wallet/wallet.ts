import {generatePrivateKey, getAddressFromPriKey, getBase58CheckAddress, getPubKeyFromPriKey} from "../../utils/crypto";
import {byteArray2hexStr, hexStr2byteArray} from "../../utils/code";

function generateWallet() {
  const privateKeyBytes = generatePrivateKey();
  const publicKeyBytes = getPubKeyFromPriKey(privateKeyBytes);
  const addressBytes = getAddressFromPriKey(privateKeyBytes);

  const privateKey = byteArray2hexStr(privateKeyBytes);
  const publicKey = byteArray2hexStr(publicKeyBytes);

  return {
    privateKey,
    publicKey,
    address: {
      base58: getBase58CheckAddress(addressBytes),
      hex: byteArray2hexStr(addressBytes)
    }
  }
}

export default class Wallet {

  public readonly address: string;
  public readonly privateKey?: string;

  constructor(address: string, privateKey?: string) {
    this.address = address;
    this.privateKey = privateKey;
  }

  static create() {
    const { address, privateKey } = generateWallet();
    return new Wallet(address.base58, privateKey);
  }

  static importPrivateKey(privateKey: string) {
    const addressBytes = getAddressFromPriKey(hexStr2byteArray(privateKey));
    return new Wallet(getBase58CheckAddress(addressBytes), privateKey);
  }
}
