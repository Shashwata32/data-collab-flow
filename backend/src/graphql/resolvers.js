const { withFilter } = require('graphql-subscriptions');
const { pubsub } = require('../lib/pubsub');
const db = require('../services/dbService');
const { authenticate } = require('../services/authService');

const DASHBOARD_UPDATED = 'DASHBOARD_UPDATED';

const resolvers = {
  Query: {
    myDashboards: async (_, __, context) => {
      const user = authenticate(context.token);
      return db.getUserDashboards(user.id);
    },
    dashboard: async (_, { id }, context) => {
      const user = authenticate(context.token);
      return db.getDashboardById(id, user.id);
    },
  },
  Mutation: {
    // Auth Resolvers
    register: (_, { username, email, password }) => {
      return db.registerUser(username, email, password);
    },
    login: (_, { email, password }) => {
      return db.loginUser(email, password);
    },

    // Organization Resolver
    createOrganization: (_, { name }, context) => {
      const user = authenticate(context.token);
      return db.createOrganization(name, user.id);
    },

    // Dashboard Resolvers
    createDashboard: (_, { name, orgId }, context) => {
      const user = authenticate(context.token);
      return db.createDashboard(name, orgId, user.id);
    },
    updateDashboard: async (_, { id, name, status }, context) => {
      const user = authenticate(context.token);
      const updatedDashboard = await db.updateDashboard(id, name, status, user.id);
      // Publish the update to a generic topic
      pubsub.publish(DASHBOARD_UPDATED, { dashboardUpdated: updatedDashboard });
      return updatedDashboard;
    },
    
    // Chart Resolvers
    addChart: async (_, { dashboardId, type, data, position }, context) => {
        const user = authenticate(context.token);
        const newChart = await db.addChart(dashboardId, type, data, position, user.id);
        const updatedDashboard = await db.getDashboardById(dashboardId, user.id);
        pubsub.publish(DASHBOARD_UPDATED, { dashboardUpdated: updatedDashboard });
        return newChart;
    },
    updateChart: async (_, { id, data, position }, context) => {
        const user = authenticate(context.token);
        const updatedChart = await db.updateChart(id, data, position, user.id);
        const dashboard = await db.getDashboardFromChartId(id);
        const updatedDashboard = await db.getDashboardById(dashboard.id, user.id);
        pubsub.publish(DASHBOARD_UPDATED, { dashboardUpdated: updatedDashboard });
        return updatedChart;
    },
    
    // Comment Resolver
    addComment: async (_, { chartId, message }, context) => {
        const user = authenticate(context.token);
        const newComment = await db.addComment(chartId, message, user.id);
        const dashboard = await db.getDashboardFromChartId(chartId);
        const updatedDashboard = await db.getDashboardById(dashboard.id, user.id);
        pubsub.publish(DASHBOARD_UPDATED, { dashboardUpdated: updatedDashboard });
        return newComment;
    }
  },
  
  Subscription: {
    dashboardUpdated: {
      // Use withFilter to ensure clients only receive updates for the dashboard they are subscribed to.
      subscribe: withFilter(
        () => pubsub.subscribe(DASHBOARD_UPDATED),
        (payload, variables) => {
          return payload.dashboardUpdated.id === variables.dashboardId;
        }
      ),
    }
  },

  // Nested Resolvers for Data Relations
  Organization: {
    owner: (organization) => db.getUserById(organization.owner_id),
  },
  Dashboard: {
    organization: (dashboard) => db.getOrganizationById(dashboard.org_id),
    charts: (dashboard) => db.getChartsByDashboardId(dashboard.id),
  },
  Chart: {
    comments: (chart) => db.getCommentsByChartId(chart.id),
  },
  Comment: {
    user: (comment) => db.getUserById(comment.user_id),
  }
};

module.exports = { resolvers };
