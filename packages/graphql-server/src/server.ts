import {resolvers} from "./schema/resolvers";
import {ApolloServer, makeExecutableSchema} from "apollo-server";
import fs = require("fs");

export const schemaFile = fs.readFileSync(__dirname + "/schema/schema.graphqls", "utf8").toString();

export  const schema = makeExecutableSchema({
  typeDefs: schemaFile,
  resolvers,
});

export const server = new ApolloServer({
  cors: true,
  schema,
});
