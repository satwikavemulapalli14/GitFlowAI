const config = require('../config');

const AI_TIMEOUT = 30000;
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000];

const SYSTEM_PROMPT = `You are an expert code reviewer. Analyze the given pull request changes and provide feedback in JSON format.

For each file changed, review the diff carefully. Return a JSON object with this exact structure:
{
  "overallScore": <integer 0-100>,
  "summary": "<concise summary of the review>",
  "bugs": [{ "file": "<file-path>", "line": <number|null>, "severity": "critical"|"major"|"minor", "message": "<description>", "suggestion": "<how to fix>" }],
  "security": [{ "file": "<file-path>", "line": <number|null>, "severity": "critical"|"major"|"minor", "message": "<description>", "suggestion": "<how to fix>" }],
  "performance": [{ "file": "<file-path>", "line": <number|null>, "severity": "critical"|"major"|"minor", "message": "<description>", "suggestion": "<how to fix>" }],
  "readability": [{ "file": "<file-path>", "line": <number|null>, "severity": "critical"|"major"|"minor", "message": "<description>", "suggestion": "<how to fix>" }],
  "maintainability": [{ "file": "<file-path>", "line": <number|null>, "severity": "critical"|"major"|"minor", "message": "<description>", "suggestion": "<how to fix>" }],
  "codeSmells": [{ "file": "<file-path>", "line": <number|null>, "severity": "critical"|"major"|"minor", "message": "<description>", "suggestion": "<how to fix>" }]
}

Rules:
- overallScore: 0-100 where 100 is perfect code
- Each issue array can be empty if no issues found
- Only report actual issues you can see in the diff
- Be specific about file paths and line numbers when possible
- Provide actionable suggestions
- Be constructive and professional`;

function buildPrompt(repo, pr, changedFiles) {
  let prompt = `Repository: ${repo.fullName || repo}\n`;
  prompt += `Pull Request: ${pr.title || `#${pr.number}`}\n`;
  prompt += `Description: ${pr.description || 'No description provided'}\n\n`;
  prompt += `## Changed Files\n\n`;

  for (const file of changedFiles) {
    prompt += `### ${file.filename} (${file.status}, +${file.additions}/-${file.deletions})\n`;
    if (file.patch) {
      prompt += `\`\`\`diff\n${file.patch}\n\`\`\`\n\n`;
    }
  }

  return prompt;
}

function parseResponse(text) {
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*$/g, '').trim();
  return JSON.parse(cleaned);
}

async function callOpenAI(prompt, apiKey, signal) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    }),
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(`OpenAI API error ${response.status}: ${err.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenAI returned empty response');

  return parseResponse(content);
}

async function generateReview(repo, pr, changedFiles) {
  const apiKey = config.openai.apiKey;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');

  const prompt = buildPrompt(repo, pr, changedFiles);
  let lastError;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = RETRY_DELAYS[attempt - 1] || 4000;
      await new Promise((r) => setTimeout(r, delay));
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT);

    try {
      const result = await callOpenAI(prompt, apiKey, controller.signal);
      clearTimeout(timeout);

      validateResult(result);
      return result;
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;

      if (error.name === 'AbortError') {
        lastError = new Error('AI request timed out after 30 seconds');
      }
    }
  }

  throw lastError || new Error('AI review failed after retries');
}

function validateResult(result) {
  if (typeof result.overallScore !== 'number' || result.overallScore < 0 || result.overallScore > 100) {
    throw new Error('Invalid overallScore in AI response');
  }
  const categories = ['bugs', 'security', 'performance', 'readability', 'maintainability', 'codeSmells'];
  for (const cat of categories) {
    if (!Array.isArray(result[cat])) {
      throw new Error(`Missing or invalid "${cat}" array in AI response`);
    }
  }
}

module.exports = { generateReview };
