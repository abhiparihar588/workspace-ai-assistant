/**
 * routes/user.routes.js
 * GET    /api/users               (manager)
 * GET    /api/users/team-overview (manager)
 * GET    /api/users/:id
 * PUT    /api/users/:id
 * DELETE /api/users/:id          (manager)
 */

const express = require('express');
const router  = express.Router();

const userController          = require('../controllers/user.controller');
const { protect, authorize }  = require('../middleware/auth');

router.use(protect);

// Manager-only
router.get('/',             authorize('manager'), userController.getAllUsers);
router.get('/team-overview', authorize('manager'), userController.getTeamOverview);
router.delete('/:id',       authorize('manager'), userController.deactivateUser);

// Both roles (with own-data restrictions enforced in controller)
router.get('/:id',  userController.getUserById);
router.put('/:id',  userController.updateUser);

module.exports = router;
