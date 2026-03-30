const router = require('express').Router();
const usersController = require('../controllers/users.controller');
const { authenticateToken, requireAdmin } = require('../middleware/role.middleware');

// Protect all user routes — only authenticated org users
router.use(authenticateToken);

// POST /api/users (admin only)
router.post('/', requireAdmin, usersController.createUser);

// GET /api/users (admin or manager)
router.get('/', requireAdmin, usersController.getUsers);

// GET /api/users/:id (own data or admin)
router.get('/:id', usersController.getUserById);

module.exports = router;
