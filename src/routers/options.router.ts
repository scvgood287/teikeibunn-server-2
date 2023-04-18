import { Router } from 'express';
import { optionsController } from '../controllers';

const router = Router();

router.post('/:productId', optionsController.createOptions);
router.delete('/:optionIds', optionsController.removeOptions);
router.patch('', optionsController.updateOptions);

export default router;
