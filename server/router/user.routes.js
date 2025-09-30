// routes/users.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/user.controller');
const auth = require('../middlewares/authMiddleware');
const { requireRole, ROLES } = require('../middlewares/roleMiddleware');

router.get('/staff', auth, requireRole(ROLES.ADMIN), ctrl.listStaff);
router.get('/assignable', ctrl.listAssignableUsers);

// Admin creates users (STAFF/ADMIN/CUSTOMER)
router.post('/', auth, requireRole(ROLES.ADMIN), ctrl.adminCreate);

// Admin list (optional filters ?role=&q=)
router.get('/', auth, requireRole(ROLES.ADMIN), ctrl.getAllUsers);

// Admin or self
router.get('/:id', auth, ctrl.getById);
router.patch('/:id', auth, ctrl.updateById);

// Admin only
router.delete('/:id', auth, requireRole(ROLES.ADMIN), ctrl.removeById);


module.exports = router;
