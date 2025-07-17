const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';

// User and Auth Functions
async function registerUser(username, email, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const res = await pool.query(
    'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
    [username, email, hashedPassword]
  );
  return res.rows[0];
}

async function loginUser(email, password) {
  const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = res.rows[0];

  if (user && await bcrypt.compare(password, user.password_hash)) {
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    return { token, user: { id: user.id, username: user.username, email: user.email } };
  }
  throw new Error('Invalid credentials');
}

// Dashboard Functions
async function getUserDashboards(userId) {
  const res = await pool.query(
    'SELECT d.* FROM dashboards d JOIN user_organizations uo ON d.org_id = uo.org_id WHERE uo.user_id = $1',
    [userId]
  );
  return res.rows;
}

async function getDashboardById(dashboardId, userId) {
  const res = await pool.query(
    'SELECT d.* FROM dashboards d JOIN user_organizations uo ON d.org_id = uo.org_id WHERE d.id = $1 AND uo.user_id = $2',
    [dashboardId, userId]
  );
  return res.rows[0];
}

async function createDashboard(name, orgId, userId) {
    const res = await pool.query(
        'INSERT INTO dashboards (name, org_id, created_by) VALUES ($1, $2, $3) RETURNING *',
        [name, orgId, userId]
    );
    return res.rows[0];
}

async function updateDashboard(id, name, status, userId) {
    const dashboard = await getDashboardById(id, userId);
    if (!dashboard) throw new Error('Dashboard not found or access denied');

    const newName = name || dashboard.name;
    const newStatus = status || dashboard.status;

    const res = await pool.query(
        'UPDATE dashboards SET name = $1, status = $2 WHERE id = $3 RETURNING *',
        [newName, newStatus, id]
    );
    return res.rows[0];
}

// Chart Functions
async function addChart(dashboardId, type, data, position, userId) {
    const dashboard = await getDashboardById(dashboardId, userId);
    if (!dashboard) throw new Error('Dashboard not found or access denied');

    const res = await pool.query(
        'INSERT INTO charts (dashboard_id, type, data, position) VALUES ($1, $2, $3, $4) RETURNING *',
        [dashboardId, type, data, position]
    );
    return res.rows[0];
}

async function updateChart(id, data, position, userId) {
    const chartRes = await pool.query('SELECT * FROM charts WHERE id = $1', [id]);
    const chart = chartRes.rows[0];
    if (!chart) throw new Error('Chart not found');

    const dashboard = await getDashboardById(chart.dashboard_id, userId);
    if (!dashboard) throw new Error('Access denied');

    const newData = data || chart.data;
    const newPosition = position || chart.position;

    const res = await pool.query(
        'UPDATE charts SET data = $1, position = $2 WHERE id = $3 RETURNING *',
        [newData, newPosition, id]
    );
    return res.rows[0];
}


// Comment Functions
async function addComment(chartId, message, userId) {
    const res = await pool.query(
        'INSERT INTO comments (chart_id, user_id, message) VALUES ($1, $2, $3) RETURNING *',
        [chartId, userId, message]
    );
    return res.rows[0];
}

module.exports = {
  registerUser,
  loginUser,
  getUserDashboards,
  getDashboardById,
  createDashboard,
  updateDashboard,
  addChart,
  updateChart,
  addComment,
};
