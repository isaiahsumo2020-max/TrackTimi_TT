const router = require('express').Router();
const usersController = require('../controllers/users.controller');
const { authenticateToken, requireAdmin } = require('../middleware/role.middleware');

// Protect all user routes — only authenticated org users
router.use(authenticateToken);

// GET /api/users/admins/list - Get all organization admins
router.get('/admins/list', usersController.getAdmins);

// POST /api/users (admin only)
router.post('/', requireAdmin, usersController.createUser);

// GET /api/users (admin or manager)
router.get('/', requireAdmin, usersController.getUsers);

// GET /api/users/:id (own data or admin)
router.get('/:id', usersController.getUserById);

// PUT /api/users/:id (admin only - update user)
router.put('/:id', requireAdmin, usersController.updateUser);

// PUT /api/users/:id/change-password (admin only - change user password)
router.put('/:id/change-password', requireAdmin, usersController.changeUserPassword);

// DELETE /api/users/:id (admin only - delete user)
router.delete('/:id', requireAdmin, usersController.deleteUser);

// POST /api/users/:id/avatar (admin only - upload user avatar)
router.post('/:id/avatar', requireAdmin, usersController.uploadAvatar);

module.exports = router;
