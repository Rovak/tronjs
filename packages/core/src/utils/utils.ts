import validator from 'validator';
import BigNumber from 'bignumber.js';
import {hexStr2byteArray} from "./code";
import {getBase58CheckAddress, isAddressValid} from "./crypto";

export function isValidURL(url) {
  return validator.isURL(url.toString(), {
    protocols: [ 'http', 'https' ]
  });
}

export function isObject(obj) {
  return obj === Object(obj) && Object.prototype.toString.call(obj) !== '[object Array]';
}

export function isArray(array) {
  return Array.isArray(array);
}

export function isJson(string) {
  try {
    return !!JSON.parse(string);
  } catch (ex) {
    return false;
  }
}

export function isBoolean(bool) {
  return typeof bool === 'boolean';
}

export function isBigNumber(number) {
  return number && (number instanceof BigNumber || (number.constructor && number.constructor.name === 'BigNumber'));
}

export function isString(string) {
  return typeof string === 'string' || (string && string.constructor && string.constructor.name === 'String');
}

export function isFunction(obj) {
  return typeof obj === 'function';
}

export function isHex(string) {
  return typeof string === 'string' && !isNaN(parseInt(string, 16));
}

export function isInteger(number) {
  return Number.isInteger(
    Number(number)
  );
}

export function isAddress(address: string) {
    if(!isString(address))
      return false;

    // Convert HEX to Base58
    if(address.length === 42) {
      try {
        return isAddress(
          getBase58CheckAddress(
            hexStr2byteArray(address) // it throws an error if the address starts with 0x
          )
        );
      } catch (err) {
        return false;
      }
    }
    try {
      return isAddressValid(address);
    } catch (err) {
      return false;
    }

}

export function hasProperty(obj, property) {
  return Object.prototype.hasOwnProperty.call(obj, property);
}

export function hasProperties(obj, ...properties) {
  return properties.length && !properties.map(property => {
    return this.hasProperty(obj, property)
  }).includes(false);
}

export function mapEvent(event) {
  return {
    block: event.block_number,
    timestamp: event.block_timestamp,
    contract: event.contract_address,
    name: event.event_name,
    transaction: event.transaction_id,
    result: event.result
  };
}

export function parseEvent(event, { inputs: abi }) {

  if(!event.result)
    return event;

  event.result = event.result.reduce((obj, result, index) => {
    const {
      name,
      type
    } = abi[index];

    if(type === 'address')
      result = '41' + result.substr(2).toLowerCase();

    obj[name] = result;

    return obj;
  }, {});

  return event;
}
