const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  addNote,
} = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');
const { customerValidator } = require('../middleware/validators');
const upload = require('../middleware/uploadMiddleware');
const {
  previewImport,
  commitImport,
  exportCustomers,
} = require('../controllers/importExportController');

// All customer routes require authentication
router.use(protect);

router.route('/').get(getCustomers).post(customerValidator, createCustomer);

// Excel Import & Export routes — declared before "/:id" so "import"/"export" are
// never mistaken for a customer id.
router.post('/import/preview', upload.single('file'), previewImport);
router.post('/import', commitImport);
router.get('/export', exportCustomers);

router.route('/:id').get(getCustomerById).put(updateCustomer).delete(deleteCustomer);

router.post('/:id/notes', addNote);

module.exports = router;
