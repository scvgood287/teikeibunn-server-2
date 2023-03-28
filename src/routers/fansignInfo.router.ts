import { Router } from 'express';
import { fansignInfoController } from '../controllers';
import { checkCache } from '../middlewares';

const router = Router();

router.use(checkCache.checkAmebloCache);

router.get('/', fansignInfoController.getFansignInfo);
router.delete('/cache', fansignInfoController.deleteFansignInfoCache);

export default router;
