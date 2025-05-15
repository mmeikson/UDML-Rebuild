import { Request, Response } from 'express';
import { processingService } from '../services/processing.service';

/**
 * Process Controller
 * Handles requests related to processing Figma JSON data
 */
export const processController = {
  /**
   * Convert Figma JSON to XML
   */
  convertToXml: async (req: Request, res: Response) => {
    try {
      const { figmaData } = req.body;
      
      if (!figmaData) {
        return res.status(400).json({ 
          error: 'Missing figmaData in request body' 
        });
      }
      
      // Process the Figma JSON and convert to XML
      const xmlData = await processingService.convertToXml(figmaData);
      
      return res.status(200).json({
        success: true,
        data: {
          xml: xmlData
        }
      });
    } catch (error) {
      console.error('Error converting to XML:', error);
      return res.status(500).json({ 
        error: 'Failed to convert Figma data to XML',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },
  
  /**
   * Analyze components in Figma JSON
   */
  analyzeComponents: async (req: Request, res: Response) => {
    try {
      const { figmaData } = req.body;
      
      if (!figmaData) {
        return res.status(400).json({ 
          error: 'Missing figmaData in request body' 
        });
      }
      
      // Analyze the components in the Figma JSON
      const analysis = await processingService.analyzeComponents(figmaData);
      
      return res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('Error analyzing components:', error);
      return res.status(500).json({ 
        error: 'Failed to analyze components',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}; 