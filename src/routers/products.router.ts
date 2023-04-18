import { Router } from 'express';
import { productsController } from '../controllers';
import { validation } from '../middlewares';

const router = Router();

router.get('/:urlId', validation.validateCache, productsController.getProducts);

router.post('/:urlId', productsController.createProducts);
router.delete('/:productIds', productsController.removeProducts);
router.patch('', productsController.updateProducts);
router.put('/cache/:urlId', validation.validateCache, productsController.updateProductsCache);

export default router;
