import { Request, Response } from 'express';

export class AutomationController {
  static async getAutomations(req: Request, res: Response) {
    res.json({ 
      success: true,
      data: [],
      message: 'Automation feature coming soon',
      timestamp: new Date().toISOString()
    });
  }
}
