const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  // Use the DB_HOST variable, defaulting to 'db' for Docker
  host: process.env.DB_HOST || 'db',
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

// ... rest of the file remains the same
// A simple helper function to create an error object
const createError = (message, code = 500) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

// User Registration
async function registerUser(username, email, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const res = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );
    const user = res.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return { token, user };
  } catch (err) {
    if (err.code === '23505') { // Unique violation
      throw createError('User with this email already exists.', 409);
    }
    throw createError('Could not register user.', 500);
  }
}

// User Login
async function loginUser(email, password) {
  const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (res.rows.length === 0) {
    throw createError('Invalid email or password.', 401);
  }
  const user = res.rows[0];
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw createError('Invalid email or password.', 401);
  }
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const userPayload = { id: user.id, username: user.username, email: user.email };
  return { token, user: userPayload };
}

// Get User by ID
async function getUserById(id) {
    const res = await pool.query('SELECT id, username, email FROM users WHERE id = $1', [id]);
    return res.rows[0];
}

// Get Organization by ID
async function getOrganizationById(id) {
    const res = await pool.query('SELECT * FROM organizations WHERE id = $1', [id]);
    return res.rows[0];
}

// Get Dashboards for a user
async function getUserDashboards(userId) {
    const res = await pool.query(`
        SELECT d.* FROM dashboards d
        JOIN organization_members om ON d.org_id = om.org_id
        WHERE om.user_id = $1
    `, [userId]);
    return res.rows;
}

// Get Dashboard by ID
async function getDashboardById(dashboardId, userId) {
    const res = await pool.query(`
        SELECT d.* FROM dashboards d
        JOIN organization_members om ON d.org_id = om.org_id
        WHERE d.id = $1 AND om.user_id = $2
    `, [dashboardId, userId]);
    if (res.rows.length === 0) {
        throw createError('Dashboard not found or access denied.', 404);
    }
    return res.rows[0];
}

// Get Charts by Dashboard ID
async function getChartsByDashboardId(dashboardId) {
    const res = await pool.query('SELECT * FROM charts WHERE dashboard_id = $1', [dashboardId]);
    return res.rows;
}

// Get Comments by Chart ID
async function getCommentsByChartId(chartId) {
    const res = await pool.query('SELECT * FROM comments WHERE chart_id = $1 ORDER BY created_at ASC', [chartId]);
    return res.rows;
}

// Get Dashboard from Chart ID
async function getDashboardFromChartId(chartId) {
  const res = await pool.query(
    'SELECT d.* FROM dashboards d JOIN charts c ON d.id = c.dashboard_id WHERE c.id = $1',
    [chartId]
  );
  if (res.rows.length === 0) {
    throw createError('Chart not found to determine dashboard.', 404);
  }
  return res.rows[0];
}


// Create Organization
async function createOrganization(name, ownerId) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const orgRes = await client.query(
            'INSERT INTO organizations (name, owner_id) VALUES ($1, $2) RETURNING *',
            [name, ownerId]
        );
        const organization = orgRes.rows[0];
        await client.query(
            'INSERT INTO organization_members (org_id, user_id, role) VALUES ($1, $2, $3)',
            [organization.id, ownerId, 'ADMIN']
        );
        await client.query('COMMIT');
        return organization;
    } catch (e) {
        await client.query('ROLLBACK');
        throw createError('Could not create organization.', 500);
    } finally {
        client.release();
    }
}

// Create Dashboard
async function createDashboard(name, orgId, userId) {
    const memberRes = await pool.query(
        'SELECT * FROM organization_members WHERE org_id = $1 AND user_id = $2',
        [orgId, userId]
    );
    if (memberRes.rows.length === 0) {
        throw createError('You are not a member of this organization.', 403);
    }
    const res = await pool.query(
        'INSERT INTO dashboards (name, org_id) VALUES ($1, $2) RETURNING *',
        [name, orgId]
    );
    return res.rows[0];
}

// Update Dashboard
async function updateDashboard(id, name, status, userId) {
    const res = await pool.query(
        'UPDATE dashboards SET name = COALESCE($1, name), status = COALESCE($2, status) WHERE id = $3 RETURNING *',
        [name, status, id]
    );
    return res.rows[0];
}

// Add Chart to Dashboard
async function addChart(dashboardId, type, data, position, userId) {
    await getDashboardById(dashboardId, userId);
    const res = await pool.query(
        'INSERT INTO charts (dashboard_id, type, data, position) VALUES ($1, $2, $3, $4) RETURNING *',
        [dashboardId, type, data, position]
    );
    return res.rows[0];
}

// Update Chart
async function updateChart(id, data, position, userId) {
    const dashboard = await getDashboardFromChartId(id);
    await getDashboardById(dashboard.id, userId);

    const res = await pool.query(
        'UPDATE charts SET data = COALESCE($1, data), position = COALESCE($2, position) WHERE id = $3 RETURNING *',
        [data, position, id]
    );
    return res.rows[0];
}

// Add Comment to Chart
async function addComment(chartId, message, userId) {
    const dashboard = await getDashboardFromChartId(chartId);
    await getDashboardById(dashboard.id, userId);

    const res = await pool.query(
        'INSERT INTO comments (chart_id, user_id, message) VALUES ($1, $2, $3) RETURNING *',
        [chartId, userId, message]
    );
    return res.rows[0];
}


module.exports = {
  registerUser,
  loginUser,
  getUserById,
  getOrganizationById,
  getUserDashboards,
  getDashboardById,
  getChartsByDashboardId,
  getCommentsByChartId,
  getDashboardFromChartId,
  createOrganization,
  createDashboard,
  updateDashboard,
  addChart,
  updateChart,
  addComment
};
