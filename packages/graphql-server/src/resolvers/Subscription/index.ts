import {waitFor} from "../utils";
import {withFilter} from "apollo-server";

function evalInContext(js, context) {
  try {
    return function(str){
      return eval(str);
    }.call(context, ' with(this) { ' + js + ' } ');
  } catch (e) {
    return false;
  }
}

const transactions = [
  {
    contract: '0x1',
    index: 1,
  },
  {
    contract: '0x2',
    index: 2,
  },
  {
    contract: '0x3',
    index: 3,
  },
  {
    contract: '0x4',
    index: 4,
  },
  {
    contract: '0x5',
    index: 5,
  },
  {
    contract: '0x6',
    index: 6,
  },
];


function createListener(expression) {

  const txs = transactions.slice();

  return {
    [Symbol.asyncIterator]() {
      return this;
    },
    async next() {

      if (txs.length > 0) {
        const tx = txs.pop();

        if (evalInContext(expression, tx)) {
          return {
            value: {
              contractEvent: tx,
            },
            done: false
          };
        }

        return {
          value: null,
          done: false
        };
      }

      return {
        value: null,
        done: true
      };
    },
    return() {
      return Promise.resolve({ value: undefined, done: true });
    },
    throw(error) {
      return Promise.reject(error);
    },
  }
}

export const contractEvent = {
  subscribe: withFilter(
    (_, { query }) => createListener(query),
    (payload, variables) => {
      return !!payload;
    },
  ),
};

