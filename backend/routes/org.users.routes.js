const router = require('express').Router();
const usersController = require('../controllers/users.controller');
const { requireAdmin, authenticateToken } = require('../middleware/role.middleware');

// DEBUGGING LOG (Remove after it works)
console.log("Checking UsersController:", usersController);

// PROTECT ALL ROUTES BELOW
router.use(authenticateToken);

// POST /api/org/users - Provision User
router.post('/users', requireAdmin, usersController.createUser);

// GET /api/org/users - List Users (LINE 7)
router.get('/users', requireAdmin, usersController.getUsers);

// GET /api/org/users/:id - Single User
router.get('/users/:id', usersController.getUserById);

module.exports = router;