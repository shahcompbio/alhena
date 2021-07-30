import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { createHttpLink } from "apollo-link-http";
import { RetryLink } from "@apollo/client/link/retry";
//const httpLink = process.env.REACT_APP_GRAPHQL_URL || "/graphql";

const httpLink = process.env.REACT_APP_BASENAME
  ? process.env.REACT_APP_BASENAME + "/graphql"
  : "/graphql";

const link = createHttpLink({
  uri: httpLink,
  credentials: "same-origin",
});

const retryLink = new RetryLink({
  attempts: (count, operation, error) => {
    return !!error && operation.operationName !== "specialCase";
  },
  delay: (count, operation, error) => {
    return count * 1000 * Math.random();
  },
});

const client = new ApolloClient({
  link,
  retryLink,
  cache: new InMemoryCache(),
  shouldBatch: true,
});
export default client;
