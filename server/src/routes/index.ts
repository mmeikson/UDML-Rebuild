import { Router } from 'express';
import processRoutes from './process.routes';

const router = Router();

// Process routes for handling Figma JSON to XML conversion
router.use('/process', processRoutes);

export default router; 