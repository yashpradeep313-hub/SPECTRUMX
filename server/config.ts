/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root directory of the project
export const ROOT_DIR = path.resolve(__dirname, '..');
export const DATA_DIR = path.resolve(ROOT_DIR, 'data', 'db');
export const UPLOADS_DIR = path.resolve(ROOT_DIR, 'uploads');

// Ensure necessary directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const PORT = Number(process.env.PORT) || 3000;

export const getGeminiApiKey = (): string | null => {
  const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!key || key === 'PLACEHOLDER_API_KEY' || key.trim() === '') {
    return null;
  }
  return key.trim();
};

export const getGeminiClient = (): GoogleGenAI | null => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  try {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'spectrumx-adaptive-engine',
        },
      },
    });
  } catch (err) {
    console.warn('[Gemini Config] Failed to initialize GoogleGenAI client:', err);
    return null;
  }
};
