const router = require('express').Router();
const usersController = require('../controllers/users.controller');

// POST /api/users
router.post('/', usersController.createUser);

// GET /api/users
router.get('/', usersController.getUsers);

// GET /api/users/:id
router.get('/:id', usersController.getUserById);

module.exports = router;
