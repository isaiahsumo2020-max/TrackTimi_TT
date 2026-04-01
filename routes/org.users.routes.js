const router = require('express').Router();
const usersController = require('../controllers/users.controller');
const { requireAdmin, authenticateToken } = require('../middleware/role.middleware');

// PROTECT ALL ROUTES BELOW
router.use(authenticateToken);

// GET /api/org/users/:id - Single User
router.get('/users/:id', usersController.getUserById);

// PUT /api/org/users/:id - Update User (admin only)
router.put('/users/:id', requireAdmin, usersController.updateUser);

// PUT /api/org/users/:id/change-password - Change Password (admin only)
router.put('/users/:id/change-password', requireAdmin, usersController.changeUserPassword);

// DELETE /api/org/users/:id - Delete User (admin only)
router.delete('/users/:id', requireAdmin, usersController.deleteUser);

// POST /api/org/users/:id/avatar - Upload User Avatar (admin only)
router.post('/users/:id/avatar', requireAdmin, usersController.uploadAvatar);

module.exports = router;