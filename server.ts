/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { PDFParse } from 'pdf-parse';
import { createServer as createViteServer } from 'vite';
import { executeProposalAnalysis } from './server/pipeline';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to get Gemini client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Clean JSON response from Gemini
function cleanAndParseJson<T>(rawText: string, fallback: T): T {
  if (!rawText) return fallback;
  let cleaned = rawText.trim();
  // Remove markdown code fences if present
  if (cleaned.startsWith('```')) {
    const match = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    if (match && match[1]) {
      cleaned = match[1].trim();
    } else {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    }
  }
  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    // Attempt relaxed json extraction from first { or [ to last } or ]
    const firstBrace = cleaned.search(/[\{\[]/);
    const lastBrace = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const candidate = cleaned.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate) as T;
      } catch (nestedErr) {
        console.warn('Failed to parse json candidate:', nestedErr);
      }
    }
    console.error('cleanAndParseJson error on raw output:', err);
    return fallback;
  }
}

// API: Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// API: Parse PDF endpoint
app.post('/api/parse-pdf', async (req: Request, res: Response): Promise<void> => {
  try {
    const { base64, filename } = req.body;
    if (!base64) {
      res.status(400).json({ error: 'Missing base64 data' });
      return;
    }
    const cleanBase64 = base64.replace(/^data:application\/pdf;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    await parser.destroy();

    res.json({
      success: true,
      filename: filename || 'document.pdf',
      text: textResult.text || '',
      numPages: textResult.pages?.length || 1,
      charCount: textResult.text ? textResult.text.length : 0,
    });
  } catch (err: any) {
    console.error('Error parsing PDF:', err);
    res.status(500).json({
      error: 'Failed to parse PDF document: ' + (err.message || String(err)),
    });
  }
});

// API: Multi-stage Proposal Analysis
app.post('/api/analyze', async (req: Request, res: Response): Promise<void> => {
  const { rfpText, proposalText, criteriaConfig, scoringCriteria } = req.body;

  if (!rfpText || !proposalText) {
    res.status(400).json({ error: 'Both RFP and Proposal texts are required.' });
    return;
  }

  // Set up Server-Sent Events (SSE) for progress updates
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const sendEvent = (type: string, data: any) => {
    res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
  };

  try {
    const ai = getGeminiClient();
    const criteria = criteriaConfig || scoringCriteria;

    const report = await executeProposalAnalysis({
      ai,
      rfpText,
      proposalText,
      scoringCriteria: criteria,
      onProgress: (progress) => {
        sendEvent('stage', progress);
      },
    });

    // Send completed report
    sendEvent('complete', { report });
    res.end();
  } catch (err: any) {
    console.error('Error in multi-stage analysis pipeline:', err);
    sendEvent('error', {
      error: err.message || 'An unexpected error occurred during proposal analysis.',
    });
    res.end();
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Proposal Scorer AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
