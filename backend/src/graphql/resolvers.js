const db = require('../services/dbService');
const { authenticate } = require('../services/authService');

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
    createDashboard: async (_, { name, orgId }, context) => {
      const user = authenticate(context.token);
      return db.createDashboard(name, orgId, user.id);
    },
    updateDashboard: async (_, { id, name, status }, context) => {
      const user = authenticate(context.token);
      return db.updateDashboard(id, name, status, user.id);
    },
    addChart: async (_, { dashboardId, type, data, position }, context) => {
        const user = authenticate(context.token);
        return db.addChart(dashboardId, type, data, position, user.id);
    },
    updateChart: async (_, { id, data, position }, context) => {
        const user = authenticate(context.token);
        return db.updateChart(id, data, position, user.id);
    },
    addComment: async (_, { chartId, message }, context) => {
        const user = authenticate(context.token);
        return db.addComment(chartId, message, user.id);
    }
  },
};

module.exports = { resolvers };
