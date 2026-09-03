// src/core/external/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';

let genAI: GoogleGenerativeAI | null = null;

if (env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
}

export function getGeminiModel(modelName?: string) {
  if (!genAI) {
    if (env.GEMINI_API_KEY) {
      genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    } else {
      return null;
    }
  }
  const chosenModel = modelName || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  return genAI.getGenerativeModel({ model: chosenModel });
}
