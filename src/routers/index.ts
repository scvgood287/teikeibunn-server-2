import { Router } from 'express';
import versionsRouter from './versions.router';
import eventInfoRouter from './eventInfo.router';
import productsRouter from './products.router';
import optionsRouter from './options.router';

const router = Router();

router.use('/versions', versionsRouter);
router.use('/eventInfo', eventInfoRouter);
router.use('/products', productsRouter);
router.use('/options', optionsRouter);

export default router;
