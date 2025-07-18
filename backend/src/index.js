// Add this line to the very top of the file
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { createServer } = require('node:http')
const { createYoga } = require('graphql-yoga')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { typeDefs } = require('./graphql/schema')
const { resolvers } = require('./graphql/resolvers')
const { pubsub } = require('./lib/pubsub')

async function main() {
  const schema = makeExecutableSchema({ typeDefs, resolvers })

  const yoga = createYoga({
    schema,
    context: ({ request, connectionParams }) => {
      if (connectionParams && connectionParams.token) {
        return {
          token: connectionParams.token,
          pubsub
        };
      }

      const authorization = request.headers.get('authorization') || '';
      const token = authorization.split(' ')[1];
      
      return {
        token,
        pubsub
      };
    },
    graphiql: {
      subscriptionsProtocol: 'GRAPHQL_WS'
    }
  })

  const server = createServer(yoga)
  const PORT = 4000

  server.listen(PORT, () => {
    console.info(`🚀 Server is running on http://localhost:${PORT}${yoga.graphqlEndpoint}`)
  })
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
