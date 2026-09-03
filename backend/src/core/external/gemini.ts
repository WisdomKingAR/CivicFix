// src/core/external/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';

let genAI: GoogleGenerativeAI | null = null;

if (env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
}

export function getGeminiModel() {
  if (!genAI) {
    if (env.GEMINI_API_KEY) {
      genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    } else {
      return null;
    }
  }
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
}
