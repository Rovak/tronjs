import {resolvers} from "./schema/resolvers";
import {makeExecutableSchema, mergeSchemas} from "graphql-tools";
import fs = require("fs");
import {ApolloServer} from "apollo-server";

export const schemaFile = fs.readFileSync(__dirname + "/schema/schema.graphqls", "utf8").toString();

const abc = makeExecutableSchema({
  typeDefs: `
    type Query         
    type Mutation
    type Mock {
        a: Int
        b: Float
        c: String
        d: Boolean
        e: ID
    }
  `,
});

export const schema = mergeSchemas({
  schemas: [abc, schemaFile],
  resolvers,
});


export const server = new ApolloServer({
  cors: true,
  schema,
});
