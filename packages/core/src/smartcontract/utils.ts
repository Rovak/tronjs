import {isObject} from "lodash";
import {addressFromHex, addressToHex, addressToSmartContractHex} from "../utils/address";
import {getParamTypes} from "../utils/abi";
import {toUtf8} from "../utils";

/**
 * Parse result of data to proper types
 */
export function parseResultData(methodResult: any, resultTypes: {[ key: string]: string }) {

  if (isObject(methodResult)) {
    if (methodResult._ethersType === 'BigNumber') {
      return methodResult.toString();
    }

    for (let [name, value] of Object.entries(methodResult)) {

      switch (resultTypes[name]) {
        case "address":
          // @ts-ignore
          value = addressFromHex(value);
          break;
        case "uint8":
        case "uint16":
        case "uint64":
        case "uint256":
          value = parseInt(value.toString());
          break;
        case "uint8[]":
        case "uint16[]":
        case "uint64[]":
        case "uint256[]":
          // @ts-ignore
          value = value.map(v => v.toString());
          break;
        default:
          value = value.toString();
          break;
      }


      methodResult[name] = value;
    }

    return methodResult;

  }


  return methodResult.toString()
}

export function validateConstantResultMessage(result: string) {
  const len = result.length;
  if (len === 0 || len % 64 === 8) {
    let msg = 'The call has been reverted or has thrown an error.';
    if (len !== 0) {
      msg += ' Error message: ';
      let msg2 = '';
      let chunk = result.substring(8);
      for (let i = 0; i < len - 8; i += 64) {
        msg2 += toUtf8(chunk.substring(i, i + 64))
      }
      msg += msg2.replace(/(\u0000|\u000b|\f)+/g, ' ').replace(/ +/g, ' ').replace(/\s+$/g, '');
    }
    throw new Error(msg);
  }
}

export function parseResultMessage(result: string) {
  const len = result.length;
  if (len === 0 || len % 64 === 8) {
    let msg = 'The call has been reverted or has thrown an error.';
    if (len !== 0) {
      msg += ' Error message: ';
      let msg2 = '';
      let chunk = result.substring(8);
      for (let i = 0; i < len - 8; i += 64) {
        msg2 += toUtf8(chunk.substring(i, i + 64))
      }
      msg += msg2.replace(/(\u0000|\u000b|\f)+/g, ' ').replace(/ +/g, ' ').replace(/\s+$/g, '');
    }
    return msg;
  }

  return null;
}

/**
 * Prepares the input to be sent
 */
export function prepareInputArguments(args, inputs) {
  const types = getParamTypes(inputs);

  return args.map((arg, index) => {
    if (types[index] == 'address')
      return addressToSmartContractHex(arg);

    if (types[index] == 'address[]') {
      return args[index].map(addressToSmartContractHex);
    }

    return arg;
  });
}
