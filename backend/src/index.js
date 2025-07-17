const express = require('express');
const http = require('http');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const cors = require('cors');
const bodyParser = require('body-parser');
const { typeDefs } = require('./graphql/schema');
const { resolvers } = require('./graphql/resolvers');
const { Server } = require("socket.io");
const Redis = require("ioredis");

require('dotenv').config();

const app = express();
const httpServer = http.createServer(app);

// Redis setup
const redis = new Redis();

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('joinDashboard', (dashboardId) => {
    socket.join(dashboardId);
    console.log(`User joined dashboard: ${dashboardId}`);
  });

  socket.on('chartUpdate', (data) => {
    redis.publish('chart-updates', JSON.stringify(data));
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Subscribe to Redis channel for real-time updates
const redisSubscriber = new Redis();
redisSubscriber.subscribe('chart-updates', (err, count) => {
  if (err) {
    console.error('Failed to subscribe to Redis channel', err);
  } else {
    console.log(`Subscribed to ${count} channel(s)`);
  }
});

redisSubscriber.on('message', (channel, message) => {
  if (channel === 'chart-updates') {
    const data = JSON.parse(message);
    io.to(data.dashboardId).emit('chartUpdated', data);
  }
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

async function startServer() {
  await server.start();

  app.use(cors());
  app.use(bodyParser.json());

  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req }) => ({ token: req.headers.token }),
  }));

  await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000/graphql`);
}

startServer();
