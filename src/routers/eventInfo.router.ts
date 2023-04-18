import { Router } from 'express';
import { eventInfoController } from '../controllers';
import { validation } from '../middlewares';

const router = Router();

router.get('/:urlId', validation.validateCache, eventInfoController.getEventInfo);
router.delete('/cache/:urlId', validation.validateCache, eventInfoController.deleteEventInfoCache);
router.patch('/cache/:urlId', validation.validateCache, eventInfoController.updateEventInfoCache);

export default router;
