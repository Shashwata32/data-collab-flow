const { gql } = require('graphql-tag');

const typeDefs = gql`
  scalar JSON

  type User {
    id: ID!
    username: String!
    email: String!
  }

  type Organization {
    id: ID!
    name: String!
    owner: User!
    users: [User!]!
  }

  type Dashboard {
    id: ID!
    name: String!
    organization: Organization!
    charts: [Chart!]!
    status: String!
  }

  type Chart {
    id: ID!
    type: String!
    data: JSON!
    position: Int!
    comments: [Comment!]!
  }

  type Comment {
    id: ID!
    user: User!
    message: String!
    createdAt: String!
  }

  type Query {
    myDashboards: [Dashboard!]!
    dashboard(id: ID!): Dashboard
  }

  type Mutation {
    createDashboard(name: String!, orgId: ID!): Dashboard!
    updateDashboard(id: ID!, name: String, status: String): Dashboard
    addChart(dashboardId: ID!, type: String!, data: JSON!, position: Int!): Chart!
    updateChart(id: ID!, data: JSON, position: Int): Chart
    addComment(chartId: ID!, message: String!): Comment!
  }
`;

module.exports = { typeDefs };
