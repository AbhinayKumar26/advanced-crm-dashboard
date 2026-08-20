import { Router } from 'express';
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customer.controller';
import { validate } from '../middleware/validate.middleware';
import { protect } from '../middleware/auth.middleware';
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerQuerySchema,
} from '../validators/customer.validator';

const router = Router();

// Secure all customer routes with JWT authentication
router.use(protect);

router
  .route('/')
  .post(validate(createCustomerSchema), createCustomer)
  .get(validate(customerQuerySchema), getCustomers);

router
  .route('/:id')
  .get(getCustomerById) // ID format validation handled globally by mongoose middleware earlier or custom Zod param if needed
  .patch(validate(updateCustomerSchema), updateCustomer)
  .delete(deleteCustomer);

export default router;