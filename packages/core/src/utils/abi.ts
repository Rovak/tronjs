import * as Ethers from 'ethers';
import {addressToHex} from "./address";

const abiCoder = new Ethers.utils.AbiCoder();

export function decodeParams(names, types, output, ignoreMethodHash = false) {

  if (!output || typeof output === 'boolean') {
    ignoreMethodHash = output;
    output = types;
    types = names;
    names = [];
  }

  types = types.map(type => {
    if (/trcToken/.test(type)) {
      return type.replace(/trcToken/, 'uint256');
    }
    return type;
  });

  if (ignoreMethodHash && output.replace(/^0x/,'').length % 64 === 8)
    output = '0x' + output.replace(/^0x/,'').substring(8);

  if (output.replace(/^0x/,'').length % 64)
    throw new Error('The encoded string is not valid. Its length must be a multiple of 64.');

  // console.log("OUTPUT", types, output);

  return abiCoder.decode(types, output).reduce((obj, arg, index) => {
    if(types[index] == 'address')
      arg = '41' + arg.substr(2).toLowerCase();

    if(names.length)
      obj[names[index]] = arg;
    else obj.push(arg);

    return obj;
  }, names.length ? {} : []);
}

export function encodeParams(types, values) {

  for (let i =0;i<types.length;i++) {
    if (types[i] === 'address') {
      values[i] =  addressToHex(values[i]).replace(/^41/, '0x');
    }
  }

  return abiCoder.encode(types, values);
}


export function getFunctionSelector(abi) {
  return abi.name + '(' + getParamTypes(abi.inputs || []).join(',') + ')';
}

export function getParamTypes(params) {
  return params.map(({ type }) => type);
}

export function decodeOutput(abi, output, ignoreMethodHash = false) {
  const names = abi.map(({ name }) => name).filter(name => !!name);
  const types = abi.map(({ type }) => type);

  return decodeParams(names, types, output, ignoreMethodHash);
}
