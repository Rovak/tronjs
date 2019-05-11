import BigNumber from 'bignumber.js';
import {isBigNumber, isString} from "./utils";


export function toBigNumber(amount: any = 0): BigNumber {
  if(isBigNumber(amount))
    return amount;

  if(isString(amount) && (amount.indexOf('0x') === 0 || amount.indexOf('-0x') === 0))
    return new BigNumber(amount.replace('0x', ''), 16);

  return new BigNumber(amount.toString(10), 10);
}

export function toUtf8(hex) {
  hex = hex.replace(/^0x/,'');
  return Buffer.from(hex, 'hex').toString('utf8');
}

export function fromUtf8(string) {
  return '0x' + Buffer.from(string, 'utf8').toString('hex');
}

export function toAscii(hex) {
  hex = hex.replace(/^0x/,'');
  return Buffer.from(hex, 'hex').toString('ascii');
}

export function fromAscii(string, padding) {
  return '0x' + Buffer.from(string, 'ascii').toString('hex').padEnd(padding, '0');
}

export function toDecimal(value) {
  return toBigNumber(value).toNumber();
}

export function fromDecimal(value) {
  const number = toBigNumber(value);
  const result = number.toString(16);

  return number.isLessThan(0) ? '-0x' + result.substr(1) : '0x' + result;
}

export function fromSun(sun) {
  const trx = toBigNumber(sun).div(1_000_000);
  return isBigNumber(sun) ? trx : trx.toString(10);
}

export function toSun(trx) {
  const sun = toBigNumber(trx).times(1_000_000);
  return isBigNumber(trx) ? sun : sun.toString(10);
}

export function isNotNullOrUndefined(val) {
  return val !== null && typeof val !== 'undefined';
}
