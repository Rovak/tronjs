

export function params(obj = {}) {

  let $this = this;

  return {
    to(name, func) {
      if (typeof obj[name] !== 'undefined') {
        func(obj[name]);
      }
      return $this;
    }
  }
}
