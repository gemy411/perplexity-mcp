import { Request, Response, NextFunction } from 'express';
import { API_KEYS } from '../../../config/config.js';

export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  const key = req.get('x-api-key') || (req.query.api_key as string | undefined);
  if (!key || !API_KEYS.includes(key)) {
    res.status(401).json({ error: 'Invalid or missing API key' });
    return;
  }
  next();
}
