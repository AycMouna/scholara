import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// HTTP Link pour Student Service
// Note: GraphQL typically uses direct connection, but can also go through gateway
// Option 1: Direct connection (recommended for GraphQL)
const httpLink = createHttpLink({
  uri: 'http://localhost:8081/graphql', // Direct connection to Student Service
});

// Option 2: Via API Gateway (if gateway supports GraphQL)
// const httpLink = createHttpLink({
//   uri: 'http://localhost:8084/api/students/graphql', // Via Gateway
// });

// Auth Link pour ajouter le token d'authentification
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

// Configuration Apollo Client
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

export default client;
