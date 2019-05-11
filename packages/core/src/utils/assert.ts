
export function check(value, ...funcs) {

  let message = funcs[funcs.length - 1] || `${value} invalid value`;

  for (let func of funcs) {
    if (typeof func == 'function') {
      if (!func(value)) {
        console.error(message);
        throw new Error(message);
      }
    }
  }

  return true;
}

export function isNumber(e: any) {
  return typeof e === 'number';
}

export function isString(e: any) {
  return typeof e === 'string';
}

export function isAddress(e: any) {
  return check(e, isString, size(34));
}

export function gt(nr: number) {
  return (e: any) => {
    return e > nr;
  }
}

export function size(nr: number) {
  return (e: any) => {
    if (typeof e === 'string')
      return e.length === nr;

    if (typeof e === 'number')
      return e === nr;

    return false;
  }
}
