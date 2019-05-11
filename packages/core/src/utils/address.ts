import {decodeBase58Address, getBase58CheckAddress} from "./crypto";
import {byteArray2hexStr, hexStr2byteArray} from "./code";
import {isHex} from "./utils"

export const ADDRESS_SIZE = 34;
export const ADDRESS_PREFIX = "41";
export const ADDRESS_PREFIX_BYTE = 0x41;

/**
 * Convert a hex format to base58 encoding
 *
 * @param address
 */
export function addressFromHex(address: string): string {
  if(!isHex(address)) {
    return address;
  }
  return getBase58CheckAddress(
    hexStr2byteArray(address)
  );
}

/**
 * Convert a hex format to base58 encoding
 *
 * @param address
 */
export function smartContractHexToAddress(address: string): string {
  if(!isHex(address)) {
    return address;
  }

  return getBase58CheckAddress(
    hexStr2byteArray(address.replace(/^(0x)/, '41'))
  );
}

/**
 * Convert address to hex format
 *
 * @param address
 */
export function addressToHex(address: string): string {
  if(isHex(address))
    return address.toLowerCase();

  return byteArray2hexStr(decodeBase58Address(address)).toLowerCase();
}

/**
 * Converts the address to a format compatible with Smart Contract input
 * @param address
 */
export function addressToSmartContractHex(address: string): string {
  return addressToHex(address).replace(/^(41)/, '0x');
}
