import 'dotenv/config'

export const API_KEYS: string[] = process.env.API_KEYS
  ? process.env.API_KEYS.split(',').map(k => k.trim())
  : [];
