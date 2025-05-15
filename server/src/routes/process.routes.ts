import { Router } from 'express';
import { processController } from '../controllers/process.controller';

const router = Router();

// Route to process Figma JSON and convert to XML
router.post('/convert', processController.convertToXml);

// Route to analyze a Figma JSON file and return component info
router.post('/analyze', processController.analyzeComponents);

export default router; 