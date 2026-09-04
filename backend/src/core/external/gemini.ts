// backend/src/core/external/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';

let genAI: GoogleGenerativeAI | null = null;

if (env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
} else {
  console.warn('⚠️ GEMINI_API_KEY not set — AI features will use fallback mode.');
}

export function getGeminiModel() {
  if (!genAI) {
    if (env.GEMINI_API_KEY) {
      genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    } else {
      return null;
    }
  }
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

/**
 * Fetches an image from a URL and returns it as a base64 inlineData part
 * for Gemini Vision. Works with Cloudinary URLs and standard web images.
 */
export async function urlToInlinePart(imageUrl: string) {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${imageUrl} (Status ${response.status})`);
  }
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const mimeType = response.headers.get('content-type') || 'image/jpeg';
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
}
