const { gql } = require('graphql-tag');

const typeDefs = gql`
  scalar JSON

  type User {
    id: ID!
    username: String!
    email: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Organization {
    id: ID!
    name: String!
    owner: User!
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
    # Auth
    register(username: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    # Organization
    createOrganization(name: String!): Organization!

    # Dashboard
    createDashboard(name: String!, orgId: ID!): Dashboard!
    updateDashboard(id: ID!, name: String, status: String): Dashboard
    
    # Chart
    addChart(dashboardId: ID!, type: String!, data: JSON!, position: Int!): Chart!
    updateChart(id: ID!, data: JSON, position: Int): Chart
    
    # Comment
    addComment(chartId: ID!, message: String!): Comment!
  }
`;

module.exports = { typeDefs };
