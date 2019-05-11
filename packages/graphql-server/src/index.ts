import {ApolloServer} from 'apollo-server';
import {schema} from "./server";

export const server = new ApolloServer({
  cors: true,
  schema,
});
