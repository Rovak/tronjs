import {withFilter} from "apollo-server";
import RedisPubSub from "../../infrastructure/redis/pubsub";
import RedisFactory from "../../infrastructure/redis/factory";
import { StandardContext, SpelExpressionEvaluator } from 'spel2js';
import {addressFromHex} from "@trx/core/src/utils/address";
import {waitFor} from "@trx/core/src/utils/promises";


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


function createListener(expression = '') {

  const client = new RedisPubSub(new RedisFactory().createClient());

  const txs = [];

  const context = StandardContext.create();
  const compiledExpression = SpelExpressionEvaluator.compile(expression);

  const sub = client.subscribe("full:transaction").subscribe((tx: any) => {


    const locals = {
      parameter: tx.raw_data.contract[0].parameter.value,
      fromAddress: addressFromHex(tx.raw_data.contract[0].parameter.value.owner_address),
    };

    try {
      if (!expression || compiledExpression.eval(context, locals)) {
        txs.push(tx);
      }
    } catch (e) {
      console.error("error", locals);
    }
  });

  return {
    [Symbol.asyncIterator]() {
      return this;
    },
    async next() {

      if (txs.length > 0) {
        const tx = txs.pop();

        return {
          value: {
            transaction: {
              hash: tx.txID,
              parameters: tx.raw_data.contract[0].parameter.value,
            },
          },
          done: false,
        };
      }

      await waitFor(300);

      return {
        value: null,
        done: false
      };
    },
    return() {
      sub.unsubscribe();
      return Promise.resolve({ value: undefined, done: true });
    },
    throw(error) {
      sub.unsubscribe();
      return Promise.reject(error);
    },
  }
}

export const transaction = {
  subscribe: withFilter(
    (_, { filter }) => createListener(filter),
    (payload, variables) => {
      return !!payload;
    },
  ),
};

