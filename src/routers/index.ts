import { Router } from 'express';
import versionsRouter from './versions.router';
import fansignInfoRouter from './fansignInfo.router';

const router = Router();

router.use('/versions', versionsRouter);
router.use('/fansignInfo', fansignInfoRouter);

export default router;
