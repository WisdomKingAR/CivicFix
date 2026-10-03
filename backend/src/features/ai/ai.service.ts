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
    console.log(`[AIService] compareImages called for before="${beforeUrl}" and after="${afterUrl}"`);
    const cacheKey = `ai:compare:${sha256(`${beforeUrl}|${afterUrl}`)}`;
    const cached = memoryCache.get<ImageComparisonResult>(cacheKey);

    if (cached) {
      return { ...cached, cacheHit: true };
    }

    const model = getGeminiModel();

    if (!model) {
      console.warn('⚠️ Gemini model unavailable. Returning fail-safe comparison result.');
      const fallback: ImageComparisonResult = {
        similarity: 0.0,
        resolved: false,
        reasoning: 'Automated check: AI model unavailable or API key not configured. Routed for citizen validation.',
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

      const prompt = `You are a strict, forensic municipal infrastructure inspector verifying whether an urban repair has ACTUALLY been completed.

Image 1 is the BEFORE photo (the reported citizen incident).
Image 2 is the AFTER photo (submitted as proof of resolution).

STRICT VERIFICATION RULES:
1. SITE & SCENE IDENTITY: First, inspect physical landmarks, road geometry, curbs, pavement markings, walls, and structures to verify if Image 1 and Image 2 show the EXACT SAME PHYSICAL LOCATION.
2. UNRELATED / DIFFERENT IMAGES: If Image 2 is of a completely different place, an indoor scene, a pet/animal, an unrelated vehicle/object, or a different street, you MUST output:
   "similarity": 0.0
   "resolved": false
   "reasoning": "Photos depict completely different locations or subjects; repair cannot be verified."
3. UNRESOLVED / FAKE REPAIR: If both photos are from the same location but the defect (pothole, trash pile, broken lamp, water leak) is still present, output "resolved": false and "similarity": 0.0 to 0.2.
4. GENUINE COMPLETED REPAIR: If and only if Image 2 shows the SAME location AND the civic defect has been visibly fixed, output "resolved": true and "similarity": 0.70 to 1.0 depending on repair quality and site restoration.

Respond ONLY with valid JSON — no markdown, no backticks:
{
  "similarity": 0.0,
  "resolved": false,
  "reasoning": "Clear concise explanation of site match and repair status"
}`;

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
            : 0.0,
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
        similarity: 0.0,
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
    console.log(`[AIService] arePhotosSameIssue called for photo1="${photo1Url}" and photo2="${photo2Url}"`);
    const cacheKey = `ai:duplicate:${sha256(`${photo1Url}|${photo2Url}`)}`;
    const cached = memoryCache.get<IssueDuplicateResult>(cacheKey);

    if (cached) {
      return { ...cached, cacheHit: true };
    }

    const model = getGeminiModel();

    if (!model) {
      const fallback: IssueDuplicateResult = {
        isSameIssue: false,
        confidence: 0.0,
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

"confidence" ranges 0.0 to 1.0. If the photos depict different locations or different defects, output isSameIssue: false and confidence: 0.0.`;

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
            : 0.0,
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
        confidence: 0.0,
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
