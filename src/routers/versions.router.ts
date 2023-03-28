import { Router } from 'express';
import { versionsController } from '../controllers';

const router = Router();

router.get('/', versionsController.getVersions);

export default router;
