import GraphQLJSON from 'graphql-type-json';
import {addCache, cache, cacheQuery} from "../resolvers/utils";
import * as types from "../resolvers"

const cachedResolvers = {
  TRC20: {
    totalSupply: cache,
    decimals: cache,
    name: cache,
    symbol: cache,
  },
  Query: {
    contract: cacheQuery(({ args }) => args.address),
    token: cacheQuery(({ args }) => args.id),
  }
};

export const resolvers = addCache({
  ...types,
  JSON: GraphQLJSON,
}, cachedResolvers);
