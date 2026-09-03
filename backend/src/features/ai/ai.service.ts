// backend/src/features/ai/ai.service.ts
import { getGeminiModel, urlToInlinePart } from '../../core/external/gemini';
import { memoryCache } from '../../core/cache/memoryCache';
import { sha256 } from '../../core/utils/hash';

export interface ImageComparisonResult {
  similarity: number; // 0.0 to 1.0 (higher = more resolved/different)
  resolved: boolean;
  reasoning: string;
  cacheHit?: boolean;
  aiAvailable: boolean;
}

export interface IssueDuplicateResult {
  isSameIssue: boolean;
  confidence: number;
  reasoning: string;
  cacheHit?: boolean;
  aiAvailable: boolean;
}

export interface CategoryClassificationResult {
  category: string;
  confidence: number;
  aiAvailable?: boolean;
}

const AI_CACHE_TTL = 86400; // 24 Hours

export class AIService {
  /**
   * Compares a "before repair" photo with an "after repair" photo using Gemini Vision.
   * Passes raw base64 image bytes via inlineData to accurately inspect repair work.
   */
  public static async compareImages(
    beforeUrl: string,
    afterUrl: string
  ): Promise<ImageComparisonResult> {
    const cacheKey = `ai:compare:${sha256(`${beforeUrl}|${afterUrl}`)}`;
    const cached = memoryCache.get<ImageComparisonResult>(cacheKey);

    if (cached) {
      return { ...cached, cacheHit: true };
    }

    const model = getGeminiModel();

    if (!model) {
      console.warn('⚠️ Gemini model unavailable. Returning fallback comparison result.');
      const fallback: ImageComparisonResult = {
        similarity: 0.85,
        resolved: true,
        reasoning: 'Automated fallback: Gemini API key not configured.',
        cacheHit: false,
        aiAvailable: false,
      };
      memoryCache.set(cacheKey, fallback, AI_CACHE_TTL);
      return fallback;
    }

    try {
      const [beforePart, afterPart] = await Promise.all([
        urlToInlinePart(beforeUrl),
        urlToInlinePart(afterUrl),
      ]);

      const prompt = `You are an expert civic infrastructure inspector verifying urban repairs.

Image 1 is the BEFORE photo (the reported issue).
Image 2 is the AFTER photo (claimed to be repaired).

Determine if the civic issue in Image 1 (pothole, garbage, broken streetlight, water leak, road damage) has been fully repaired in Image 2.

Respond ONLY with valid JSON — no markdown, no backticks:
{
  "similarity": 0.0,
  "resolved": true,
  "reasoning": "Brief 1-2 sentence explanation"
}

"similarity" ranges 0.0-1.0. A score >= 0.70 means high confidence the issue was repaired.`;

      const response = await model.generateContent([beforePart, afterPart, prompt]);
      const text = response.response.text().replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(text) as {
        similarity: number;
        resolved: boolean;
        reasoning: string;
      };

      const result: ImageComparisonResult = {
        similarity:
          typeof parsed.similarity === 'number'
            ? Math.min(1, Math.max(0, parsed.similarity))
            : 0.8,
        resolved: Boolean(parsed.resolved),
        reasoning: parsed.reasoning || 'Image inspected by Gemini Vision.',
        cacheHit: false,
        aiAvailable: true,
      };

      memoryCache.set(cacheKey, result, AI_CACHE_TTL);
      return result;
    } catch (err) {
      console.error('Gemini Vision comparison error:', err);
      return {
        similarity: 0.5,
        resolved: false,
        reasoning:
          'AI image comparison temporarily unavailable. Routed for citizen confirmation.',
        cacheHit: false,
        aiAvailable: false,
      };
    }
  }

  /**
   * Compares two incident photos to detect whether they depict the SAME civic problem
   * at the same location (used for duplicate clustering).
   */
  public static async arePhotosSameIssue(
    photo1Url: string,
    photo2Url: string
  ): Promise<IssueDuplicateResult> {
    const cacheKey = `ai:duplicate:${sha256(`${photo1Url}|${photo2Url}`)}`;
    const cached = memoryCache.get<IssueDuplicateResult>(cacheKey);

    if (cached) {
      return { ...cached, cacheHit: true };
    }

    const model = getGeminiModel();

    if (!model) {
      const fallback: IssueDuplicateResult = {
        isSameIssue: false,
        confidence: 0.5,
        reasoning: 'AI model offline; clustering by geographic proximity only.',
        cacheHit: false,
        aiAvailable: false,
      };
      memoryCache.set(cacheKey, fallback, AI_CACHE_TTL);
      return fallback;
    }

    try {
      const [p1Part, p2Part] = await Promise.all([
        urlToInlinePart(photo1Url),
        urlToInlinePart(photo2Url),
      ]);

      const prompt = `You are an urban municipal incident triage system analyzing two citizen photos reported in the same 500-meter radius.

Determine whether Photo 1 and Photo 2 depict the SAME civic issue (e.g. the same pothole, same garbage overflow, same broken pole, or same road damage).

Respond ONLY with valid JSON — no markdown, no backticks:
{
  "isSameIssue": true,
  "confidence": 0.95,
  "reasoning": "Brief explanation of physical landmarks, angle, or hazard alignment"
}

"confidence" ranges 0.0 to 1.0.`;

      const response = await model.generateContent([p1Part, p2Part, prompt]);
      const text = response.response.text().replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(text) as {
        isSameIssue: boolean;
        confidence: number;
        reasoning: string;
      };

      const result: IssueDuplicateResult = {
        isSameIssue: Boolean(parsed.isSameIssue),
        confidence:
          typeof parsed.confidence === 'number'
            ? Math.min(1, Math.max(0, parsed.confidence))
            : 0.7,
        reasoning: parsed.reasoning || 'Visual feature alignment evaluated by Gemini Vision.',
        cacheHit: false,
        aiAvailable: true,
      };

      memoryCache.set(cacheKey, result, AI_CACHE_TTL);
      return result;
    } catch (err) {
      console.error('Gemini duplicate comparison error:', err);
      return {
        isSameIssue: false,
        confidence: 0.5,
        reasoning: 'Visual deduplication temporarily unavailable.',
        cacheHit: false,
        aiAvailable: false,
      };
    }
  }

  /**
   * Analyzes an incident photo to classify it into one of the known ComplaintCategory enums.
   */
  public static async analyzeImageForCategory(
    photoUrl: string
  ): Promise<CategoryClassificationResult> {
    const cacheKey = `ai:category:${sha256(photoUrl)}`;
    const cached = memoryCache.get<CategoryClassificationResult>(cacheKey);

    if (cached) {
      return cached;
    }

    const model = getGeminiModel();
    if (!model) {
      return { category: 'OTHER', confidence: 0.5, aiAvailable: false };
    }

    try {
      const imagePart = await urlToInlinePart(photoUrl);

      const prompt = `Analyze this civic issue photograph and classify it into exactly one of these categories:
POTHOLE, STREETLIGHT, GARBAGE, WATER_LEAKAGE, ROAD_DAMAGE, OTHER

Respond ONLY with valid JSON — no markdown:
{
  "category": "CATEGORY_NAME",
  "confidence": 0.95
}`;

      const response = await model.generateContent([imagePart, prompt]);
      const text = response.response.text().replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(text) as CategoryClassificationResult;

      const validCategories = [
        'POTHOLE',
        'STREETLIGHT',
        'GARBAGE',
        'WATER_LEAKAGE',
        'ROAD_DAMAGE',
        'OTHER',
      ];
      const result: CategoryClassificationResult = {
        category: validCategories.includes(parsed.category) ? parsed.category : 'OTHER',
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.7,
        aiAvailable: true,
      };

      memoryCache.set(cacheKey, result, AI_CACHE_TTL);
      return result;
    } catch (err) {
      console.error('Gemini categorization error:', err);
      return { category: 'OTHER', confidence: 0.5, aiAvailable: false };
    }
  }
}
