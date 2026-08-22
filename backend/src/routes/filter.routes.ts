import { Router } from 'express';
import { getSavedFilters, saveFilter, deleteSavedFilter, reorderFilters } from '../controllers/filter.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.use(protect);

router.get('/', getSavedFilters);
router.post('/', saveFilter);
router.patch('/reorder', reorderFilters);
router.delete('/:id', deleteSavedFilter);

export default router;