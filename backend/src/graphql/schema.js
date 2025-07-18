const { gql } = require('graphql-tag');

const typeDefs = gql`
  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each.
  type Query {
    myDashboards: [Dashboard]
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
    updateDashboard(id: ID!, name: String, status: DashboardStatus): Dashboard!
    
    # Chart
    addChart(dashboardId: ID!, type: ChartType!, data: String!, position: String): Chart!
    updateChart(id: ID!, data: String, position: String): Chart!

    # Comment
    addComment(chartId: ID!, message: String!): Comment!
  }

  # We add a Subscription type
  type Subscription {
    dashboardUpdated(dashboardId: ID!): Dashboard
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type User {
    id: ID!
    username: String!
    email: String!
    created_at: String
  }

  type Organization {
    id: ID!
    name: String!
    owner: User!
    created_at: String
  }

  type Dashboard {
    id: ID!
    name: String!
    status: DashboardStatus
    organization: Organization!
    charts: [Chart]
    created_at: String
  }

  enum DashboardStatus {
    DRAFT
    PUBLISHED
    ARCHIVED
  }

  type Chart {
    id: ID!
    type: ChartType!
    data: String # JSON string for chart data
    position: String # JSON string for position
    comments: [Comment]
    created_at: String
  }

  enum ChartType {
    LINE
    BAR
    PIE
    METRIC
  }

  type Comment {
    id: ID!
    message: String!
    user: User!
    created_at: String
  }
`;

module.exports = { typeDefs };
