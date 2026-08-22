import { Router } from 'express';
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customer.controller';
import { validate } from '../middleware/validate.middleware';
// import { updateCustomer, deleteCustomer } from '../controllers/customer.controller';
// import { protect } from '../middleware/auth.middleware';
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerQuerySchema,
} from '../validators/customer.validator';

const router = Router();

// Secure all customer routes with JWT authentication
// router.use(protect);

router
  .route('/')
  .post(createCustomer)
  .get(validate(customerQuerySchema), getCustomers);

router
  .route('/:id')
  .get(getCustomerById) 
  .put(validate(updateCustomerSchema), updateCustomer) // <-- Changed .patch to .put
  .delete(deleteCustomer);


export default router;