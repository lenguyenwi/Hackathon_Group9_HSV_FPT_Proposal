/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import {
  rfpRequirementsSchema,
  proposalClaimsSchema,
  requirementMatchSchema,
  criteriaScoresSchema,
  detectedIssuesSchema,
  actionableFixesSchema,
  executiveSummarySchema,
} from './schemas';
import type {
  RfpRequirement,
  ProposalClaim,
  MatchedRequirement,
  CriterionScore,
  ProposalIssue,
  ActionableFix,
  ProposalAnalysisReport,
  ScoringCriterionConfig,
  RequirementCategory,
  RequirementPriority,
  RequirementStatus,
  IssueSeverity,
  PipelineStageKey,
} from '../src/types';

export interface ProgressCallbackData {
  stage: PipelineStageKey;
  label: string;
  message: string;
  current?: number;
  total?: number;
}

export type ProgressCallback = (data: ProgressCallbackData) => void;

export interface AnalysisPipelineOptions {
  ai: GoogleGenAI;
  rfpText: string;
  proposalText: string;
  scoringCriteria?: ScoringCriterionConfig[];
  onProgress: ProgressCallback;
}

/**
 * Utility: Safe JSON parsing with fallback and markdown code fence cleaning
 */
export function cleanAndParseJson<T>(rawText: string | undefined | null, fallback: T): T {
  if (!rawText || typeof rawText !== 'string') return fallback;
  let cleaned = rawText.trim();

  // Strip markdown formatting if present
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
  } catch {
    // Attempt relaxed json substring extraction from outermost { or [ to outermost } or ]
    const firstBrace = cleaned.search(/[\{\[]/);
    const lastBrace = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const candidate = cleaned.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate) as T;
      } catch (nestedErr) {
        console.warn('cleanAndParseJson fallback candidate failed:', nestedErr);
      }
    }
    return fallback;
  }
}

/**
 * Concurrency helper to run async tasks in controlled batches
 */
async function mapConcurrent<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < items.length) {
      const i = currentIndex++;
      results[i] = await fn(items[i], i);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

/**
 * Stage 1 Validator: Validate and sanitize extracted RFP requirements
 */
export function validateRfpRequirements(raw: any[]): RfpRequirement[] {
  if (!Array.isArray(raw)) return [];

  const validCategories: RequirementCategory[] = [
    'functional',
    'technical',
    'scope',
    'pricing',
    'timeline',
    'support',
    'security',
    'constraint',
    'risk',
    'deliverable',
    'other',
  ];

  const validPriorities: RequirementPriority[] = ['mandatory', 'important', 'optional', 'unknown'];

  return raw
    .filter((item) => item && (item.requirement || item.title || item.sourceQuote))
    .map((item, idx) => {
      const id = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : `REQ-${String(idx + 1).padStart(2, '0')}`;
      const category: RequirementCategory = validCategories.includes(item.category)
        ? item.category
        : 'functional';
      const priority: RequirementPriority = validPriorities.includes(item.priority)
        ? item.priority
        : 'important';
      const title = typeof item.title === 'string' && item.title.trim() ? item.title.trim() : `Requirement ${idx + 1}`;
      const requirement = typeof item.requirement === 'string' && item.requirement.trim() ? item.requirement.trim() : title;
      const sourceQuote = typeof item.sourceQuote === 'string' && item.sourceQuote.trim() ? item.sourceQuote.trim() : requirement;
      const sourceSection = typeof item.sourceSection === 'string' && item.sourceSection.trim() ? item.sourceSection.trim() : 'General Requirements';

      return {
        id,
        category,
        title,
        requirement,
        priority,
        sourceQuote,
        sourceSection,
      };
    });
}

/**
 * Stage 2 Validator: Validate and sanitize extracted Proposal claims
 */
export function validateProposalClaims(raw: any[]): ProposalClaim[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item) => item && (item.text || item.sourceQuote))
    .map((item, idx) => {
      const id = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : `PROP-${String(idx + 1).padStart(2, '0')}`;
      const category = typeof item.category === 'string' ? item.category : 'technical';
      const text = typeof item.text === 'string' && item.text.trim() ? item.text.trim() : '';
      const sourceQuote = typeof item.sourceQuote === 'string' && item.sourceQuote.trim() ? item.sourceQuote.trim() : text;
      const sourceSection = typeof item.sourceSection === 'string' && item.sourceSection.trim() ? item.sourceSection.trim() : 'Proposal Core';

      return {
        id,
        category,
        text,
        sourceQuote,
        sourceSection,
      };
    });
}

/**
 * Stage 3 Validator: Validate single requirement matching result
 */
export function validateMatchedRequirement(
  raw: any,
  originalReq: RfpRequirement
): MatchedRequirement {
  const validStatuses: RequirementStatus[] = ['COVERED', 'PARTIAL', 'UNCLEAR', 'MISSING', 'CONFLICT'];
  const rawStatus = raw && typeof raw.status === 'string' ? raw.status.toUpperCase().trim() : '';
  const status: RequirementStatus = validStatuses.includes(rawStatus as RequirementStatus)
    ? (rawStatus as RequirementStatus)
    : 'UNCLEAR';

  // Strict Evidence Rule: Never invent evidence. If not found or empty, return "No evidence found"
  let proposalEvidence = raw && typeof raw.proposalEvidence === 'string' ? raw.proposalEvidence.trim() : '';
  if (!proposalEvidence || proposalEvidence.toLowerCase() === 'none' || proposalEvidence.toLowerCase().includes('not found') || proposalEvidence.toLowerCase().includes('no evidence')) {
    proposalEvidence = 'No evidence found';
  }

  // If status is MISSING, proposalEvidence MUST be strictly "No evidence found"
  if (status === 'MISSING') {
    proposalEvidence = 'No evidence found';
  }

  // Automatic severity determination according to rigorous audit rules
  let severity: IssueSeverity = 'none';
  if (status === 'CONFLICT') {
    severity = 'critical';
  } else if (status === 'MISSING') {
    severity = originalReq.priority === 'mandatory' ? 'critical' : 'major';
  } else if (status === 'PARTIAL' || status === 'UNCLEAR') {
    severity = originalReq.priority === 'mandatory' ? 'critical' : originalReq.priority === 'important' ? 'major' : 'minor';
  } else if (status === 'COVERED') {
    severity = 'none';
  }

  // Override severity if raw has explicit valid severity and it is equal or higher
  if (raw && ['critical', 'major', 'minor', 'none'].includes(raw.severity)) {
    if (status === 'CONFLICT' || (status === 'MISSING' && originalReq.priority === 'mandatory')) {
      severity = 'critical'; // Strictly preserve critical severity for fatal breaches
    } else {
      severity = raw.severity as IssueSeverity;
    }
  }

  const rfpEvidence = (raw && typeof raw.rfpEvidence === 'string' && raw.rfpEvidence.trim())
    ? raw.rfpEvidence.trim()
    : originalReq.sourceQuote || originalReq.requirement;

  const explanation = (raw && typeof raw.explanation === 'string' && raw.explanation.trim())
    ? raw.explanation.trim()
    : `Assessment for requirement ${originalReq.id}: proposal status is ${status}.`;

  const affectedScore = (raw && typeof raw.affectedScore === 'string' && raw.affectedScore.trim())
    ? raw.affectedScore.trim()
    : 'Completeness vs RFP Requirements';

  const recommendedFix = (raw && typeof raw.recommendedFix === 'string' && raw.recommendedFix.trim())
    ? raw.recommendedFix.trim()
    : status === 'COVERED'
    ? 'Maintain verified coverage in final submission.'
    : `Update the proposal to explicitly and unambiguously satisfy ${originalReq.id}.`;

  return {
    requirementId: originalReq.id,
    category: originalReq.category,
    priority: originalReq.priority,
    status,
    rfpRequirement: originalReq.requirement,
    rfpEvidence,
    proposalEvidence,
    explanation,
    severity,
    affectedScore,
    recommendedFix,
  };
}

/**
 * Stage 4 Validator: Validate Criteria Scores (1-5)
 */
export function validateCriteriaScores(
  raw: any[],
  criteriaConfig: ScoringCriterionConfig[]
): CriterionScore[] {
  const rawList = Array.isArray(raw) ? raw : [];

  return criteriaConfig.map((crit) => {
    const match = rawList.find(
      (s) =>
        s &&
        (s.id === crit.id ||
          (typeof s.criterion === 'string' &&
            s.criterion.toLowerCase().trim() === crit.name.toLowerCase().trim()))
    ) || {};

    const parsedScore = Number(match.score);
    const score = Number.isInteger(parsedScore) && parsedScore >= 1 && parsedScore <= 5
      ? parsedScore
      : 3;

    const reason = typeof match.reason === 'string' && match.reason.trim()
      ? match.reason.trim()
      : `Audit scorecard for ${crit.name}. Score: ${score}/5.`;

    const positiveEvidence = Array.isArray(match.positiveEvidence)
      ? match.positiveEvidence.map((s: unknown) => String(s)).filter((s: string) => s.trim().length > 0)
      : [];

    const negativeEvidence = Array.isArray(match.negativeEvidence)
      ? match.negativeEvidence.map((s: unknown) => String(s)).filter((s: string) => s.trim().length > 0)
      : [];

    const rfpCitations = Array.isArray(match.rfpCitations)
      ? match.rfpCitations.map((s: unknown) => String(s)).filter((s: string) => s.trim().length > 0)
      : [];

    const proposalCitations = Array.isArray(match.proposalCitations)
      ? match.proposalCitations.map((s: unknown) => String(s)).filter((s: string) => s.trim().length > 0)
      : [];

    return {
      id: crit.id,
      criterion: crit.name,
      weight: crit.weight || 15,
      score,
      reason,
      positiveEvidence,
      negativeEvidence,
      rfpCitations,
      proposalCitations,
    };
  });
}

/**
 * Stage 5 Validator: Validate Detected Issues & Cross-Check with RTM
 */
export function validateDetectedIssues(
  raw: any[],
  matchedReqs: MatchedRequirement[]
): ProposalIssue[] {
  const validSeverities = ['critical', 'major', 'minor'];
  const issues: ProposalIssue[] = [];
  const rawList = Array.isArray(raw) ? raw : [];

  rawList.forEach((item, idx) => {
    if (!item || (!item.title && !item.description)) return;

    const severity = validSeverities.includes(item.severity) ? item.severity : 'major';
    const id = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : `ISSUE-${String(idx + 1).padStart(2, '0')}`;
    const type = typeof item.type === 'string' && item.type.trim() ? item.type.trim() : 'Contract Compliance';
    const title = typeof item.title === 'string' && item.title.trim() ? item.title.trim() : `Issue ${idx + 1}`;
    const description = typeof item.description === 'string' && item.description.trim() ? item.description.trim() : title;
    const rfpEvidence = typeof item.rfpEvidence === 'string' && item.rfpEvidence.trim() ? item.rfpEvidence.trim() : 'Referenced in RFP text';
    let proposalEvidence = typeof item.proposalEvidence === 'string' && item.proposalEvidence.trim() ? item.proposalEvidence.trim() : 'No evidence found';
    if (!proposalEvidence || proposalEvidence.toLowerCase().includes('not found')) {
      proposalEvidence = 'No evidence found';
    }

    const impact = typeof item.impact === 'string' && item.impact.trim() ? item.impact.trim() : 'Evaluation score reduction';
    const recommendedAction = typeof item.recommendedAction === 'string' && item.recommendedAction.trim() ? item.recommendedAction.trim() : 'Revise proposal to align with requirement.';

    issues.push({
      id,
      severity,
      type,
      title,
      description,
      rfpEvidence,
      proposalEvidence,
      impact,
      recommendedAction,
    });
  });

  // Cross-reference guarantee: Ensure any requirement marked CONFLICT in RTM is represented as an issue
  matchedReqs
    .filter((req) => req.status === 'CONFLICT')
    .forEach((conflictReq) => {
      const alreadyReported = issues.some(
        (iss) =>
          iss.title.toLowerCase().includes(conflictReq.requirementId.toLowerCase()) ||
          iss.description.toLowerCase().includes(conflictReq.requirementId.toLowerCase()) ||
          (conflictReq.rfpEvidence && iss.rfpEvidence.includes(conflictReq.rfpEvidence.slice(0, 30)))
      );

      if (!alreadyReported) {
        issues.unshift({
          id: `ISSUE-CONF-${conflictReq.requirementId}`,
          severity: 'critical',
          type: 'Critical Contradiction',
          title: `Direct Conflict with ${conflictReq.requirementId} (${conflictReq.priority})`,
          description: `The proposal directly contradicts the client mandate: ${conflictReq.rfpRequirement}. Auditor finding: ${conflictReq.explanation}`,
          rfpEvidence: conflictReq.rfpEvidence,
          proposalEvidence: conflictReq.proposalEvidence,
          impact: 'Immediate procurement disqualification and commercial compliance failure.',
          recommendedAction: conflictReq.recommendedFix || `Eliminate conflicting proposal text and conform 100% to ${conflictReq.requirementId}.`,
        });
      }
    });

  // Cross-reference guarantee: Ensure missing mandatory requirements in RTM are represented as issues
  matchedReqs
    .filter((req) => req.status === 'MISSING' && req.priority === 'mandatory')
    .forEach((missingReq) => {
      const alreadyReported = issues.some(
        (iss) =>
          iss.title.toLowerCase().includes(missingReq.requirementId.toLowerCase()) ||
          iss.description.toLowerCase().includes(missingReq.requirementId.toLowerCase())
      );

      if (!alreadyReported) {
        issues.push({
          id: `ISSUE-MISS-${missingReq.requirementId}`,
          severity: 'critical',
          type: 'Missing Mandatory Requirement',
          title: `Omitted Mandatory Requirement: ${missingReq.requirementId}`,
          description: `The client marked this requirement as mandatory, but no supporting commitment exists in the proposal.`,
          rfpEvidence: missingReq.rfpEvidence,
          proposalEvidence: 'No evidence found',
          impact: 'Non-compliant proposal score, risk of failing mandatory threshold evaluation.',
          recommendedAction: missingReq.recommendedFix || `Add a dedicated subsection explicitly fulfilling ${missingReq.requirementId}.`,
        });
      }
    });

  return issues;
}

/**
 * Stage 6 Validator: Validate Actionable Fixes & Rewrites
 */
export function validateActionableFixes(raw: any[]): ActionableFix[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item) => item && (item.title || item.recommendedChange || item.suggestedRewrittenParagraph))
    .map((item, idx) => {
      const id = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : `FIX-${String(idx + 1).padStart(2, '0')}`;
      const title = typeof item.title === 'string' && item.title.trim() ? item.title.trim() : `Actionable Fix ${idx + 1}`;
      const category = typeof item.category === 'string' && item.category.trim() ? item.category.trim() : 'Compliance';
      const whatIsWrong = typeof item.whatIsWrong === 'string' && item.whatIsWrong.trim() ? item.whatIsWrong.trim() : 'Proposal text fails to meet explicit client mandate.';
      const whyItMatters = typeof item.whyItMatters === 'string' && item.whyItMatters.trim() ? item.whyItMatters.trim() : 'Reduces proposal win probability and risks evaluation disqualification.';
      const relevantRfpRequirement = typeof item.relevantRfpRequirement === 'string' && item.relevantRfpRequirement.trim() ? item.relevantRfpRequirement.trim() : 'Stated in RFP document.';
      let currentProposalText = typeof item.currentProposalText === 'string' && item.currentProposalText.trim() ? item.currentProposalText.trim() : 'No evidence found in proposal';
      if (!currentProposalText || currentProposalText.toLowerCase().includes('not found')) {
        currentProposalText = 'No evidence found in proposal';
      }

      const recommendedChange = typeof item.recommendedChange === 'string' && item.recommendedChange.trim() ? item.recommendedChange.trim() : 'Revise the proposal text according to the specification.';
      const suggestedRewrittenParagraph = typeof item.suggestedRewrittenParagraph === 'string' && item.suggestedRewrittenParagraph.trim() ? item.suggestedRewrittenParagraph.trim() : undefined;

      return {
        id,
        title,
        category,
        whatIsWrong,
        whyItMatters,
        relevantRfpRequirement,
        currentProposalText,
        recommendedChange,
        suggestedRewrittenParagraph,
      };
    });
}

/**
 * Multi-Stage Execution Engine
 */
export async function executeProposalAnalysis(
  options: AnalysisPipelineOptions
): Promise<ProposalAnalysisReport> {
  const { ai, rfpText, proposalText, scoringCriteria, onProgress } = options;
  const modelName = 'gemini-3.8-flash';

  const criteriaConfig: ScoringCriterionConfig[] = scoringCriteria && scoringCriteria.length > 0
    ? scoringCriteria
    : [
        { id: 'problem_understanding', name: 'Problem Understanding', weight: 15, description: "Reflects client's stated operational pain points and objectives", enabled: true },
        { id: 'scope_deliverables', name: 'Scope & Deliverables Clarity', weight: 15, description: 'Specific and unambiguous deliverables with clear boundaries', enabled: true },
        { id: 'pricing_clarity', name: 'Pricing Clarity', weight: 15, description: 'Clear fixed-bid breakdown avoiding hidden or deferred fees', enabled: true },
        { id: 'timeline_clarity', name: 'Timeline Clarity', weight: 15, description: 'Concrete milestones and phase delivery deadlines', enabled: true },
        { id: 'completeness', name: 'Completeness vs RFP Requirements', weight: 20, description: 'Full coverage of all mandatory and important RFP requirements', enabled: true },
        { id: 'tone_persuasiveness', name: 'Tone & Persuasiveness', weight: 10, description: 'Confident, client-centric, professional response', enabled: true },
        { id: 'risk_transparency', name: 'Risk / Assumptions Transparency', weight: 10, description: 'Proactive disclosure of assumptions, risks, and dependencies', enabled: true },
      ];

  // =========================================================================
  // STAGE 1: Extract atomic RFP requirements
  // =========================================================================
  onProgress({
    stage: 'rfp_extraction',
    label: 'Stage 1 of 7',
    message: 'Analyzing RFP structure & extracting atomic verifiable requirements...',
  });

  const rfpExtractionPrompt = `You are a chief enterprise procurement compliance officer.
Examine the following Request for Proposal (RFP) document.
Extract EVERY explicit requirement, constraint, deliverable, SLA, and commercial term as an individual, atomic requirement.

CRITICAL EXTRACTION RULES:
1. Do NOT combine multiple distinct obligations into a single requirement. Split them into atomic items (e.g. pilot date vs full rollout date, or real-time dashboard vs automated alerts).
2. Do NOT invent requirements. Every requirement MUST have an exact, verbatim quote in "sourceQuote" directly from the RFP text.
3. Categorize accurately:
   - 'constraint': negative rules or hard limits (e.g. database migration forbidden, budget caps, security protocols)
   - 'functional': business workflows and user features
   - 'technical': architecture, databases, APIs, protocols, infrastructure
   - 'pricing': commercial ceilings, rate cards, payment terms, fee structures
   - 'timeline': pilot phases, delivery schedules, milestones
   - 'support': SLAs, maintenance hours, ticket response times
   - 'security': SSO, RBAC, data protection, compliance
4. Classify priority:
   - 'mandatory': strict mandates using must, shall, mandatory, required, strictly not allowed, or critical constraints
   - 'important': expected items using should, expected, requested
   - 'optional': nice-to-have, bonus, optional items
   - 'unknown': unspecified

RFP TEXT TO ANALYZE:
"""
${rfpText}
"""`;

  const rfpResponse = await ai.models.generateContent({
    model: modelName,
    contents: rfpExtractionPrompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: rfpRequirementsSchema,
      temperature: 0.1,
    },
  });

  const rawExtractedReqs = cleanAndParseJson<any[]>(rfpResponse.text, []);
  const rfpRequirements = validateRfpRequirements(rawExtractedReqs);

  if (rfpRequirements.length === 0) {
    throw new Error('Could not extract verifiable requirements from the provided RFP text. Please ensure the RFP text contains substantive requirements.');
  }

  // =========================================================================
  // STAGE 2: Extract Proposal Evidence & Claims
  // =========================================================================
  onProgress({
    stage: 'proposal_claims',
    label: 'Stage 2 of 7',
    message: `Reading Proposal & indexing explicit vendor commitments (against ${rfpRequirements.length} RFP requirements)...`,
  });

  const proposalExtractionPrompt = `You are an expert contract and proposal auditor.
Read the following Proposal text and extract all substantive commitments, architectural specifications, timeline declarations, pricing structures, support terms, assumptions, and unsolicited bonus items.

CRITICAL RULES:
1. Do NOT invent commitments. Every extracted claim must have an exact verbatim quote in "sourceQuote".
2. Focus specifically on:
   - Technical architecture, database approach, integration methods
   - Project phases, delivery milestones, rollout timeline
   - Total costs, licensing models, implementation fees, ongoing support pricing
   - Support hours, ticket SLAs, maintenance terms
   - Assumptions, exclusions, and unsolicited features (e.g. experimental drones, add-ons)

PROPOSAL TEXT TO ANALYZE:
"""
${proposalText}
"""`;

  const proposalResponse = await ai.models.generateContent({
    model: modelName,
    contents: proposalExtractionPrompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: proposalClaimsSchema,
      temperature: 0.1,
    },
  });

  const rawExtractedClaims = cleanAndParseJson<any[]>(proposalResponse.text, []);
  const proposalClaims = validateProposalClaims(rawExtractedClaims);

  // =========================================================================
  // STAGE 3: Match each RFP requirement individually
  // =========================================================================
  onProgress({
    stage: 'requirement_matching',
    label: 'Stage 3 of 7',
    message: `Evaluating compliance individually for ${rfpRequirements.length} requirements...`,
  });

  const matchedRequirements: MatchedRequirement[] = await mapConcurrent(
    rfpRequirements,
    4, // Concurrency limit of 4 parallel calls for high speed and precision
    async (req, index) => {
      onProgress({
        stage: 'requirement_matching',
        label: 'Stage 3 of 7',
        message: `Evaluating requirement ${index + 1} of ${rfpRequirements.length}: [${req.id}] ${req.title}...`,
        current: index + 1,
        total: rfpRequirements.length,
      });

      const singleMatchPrompt = `You are an elite enterprise procurement compliance auditor.
Evaluate whether the draft Proposal satisfies this SINGLE RFP Requirement.

RFP REQUIREMENT DETAILS:
- Requirement ID: ${req.id}
- Priority: ${req.priority}
- Category: ${req.category}
- Requirement Statement: ${req.requirement}
- RFP Verbatim Quote: "${req.sourceQuote}"
- RFP Section: ${req.sourceSection}

VENDOR PROPOSAL CLAIMS EXTRACTED:
${JSON.stringify(proposalClaims, null, 2)}

FULL PROPOSAL TEXT FOR CONTEXT:
"""
${proposalText}
"""

EVALUATION INSTRUCTIONS:
1. Determine the status:
   - 'COVERED': Proposal clearly, specifically, and unambiguously satisfies this requirement with concrete commitments and evidence.
   - 'PARTIAL': Proposal addresses the topic but omits key specifics, satisfies only a portion (e.g., provides email alerts but omits required SMS alerts), or imposes limitations.
   - 'UNCLEAR': Proposal statement is vague, aspirational, non-committal, or lacks concrete dates/SLAs ("in a timely manner", "best industry practices", "agile sprints without fixed milestones").
   - 'MISSING': No sufficient evidence or mention exists in the Proposal. You MUST set proposalEvidence to "No evidence found".
   - 'CONFLICT': Proposal directly contradicts, breaches, or violates the explicit requirement or constraint (e.g., RFP strictly forbids database migration, but proposal proposes NoSQL database migration; or RFP requires 24/7 support included, but proposal prices it separately or offers only office hours).
2. Evidence rules:
   - Never invent proposal evidence. If no exact evidence exists, you MUST return strictly "No evidence found".
   - An eloquent or polished tone does NOT compensate for missing technical requirements or contradictory terms.
3. Severity assignment:
   - 'critical': If status is CONFLICT on any requirement, or MISSING on a mandatory requirement/constraint.
   - 'major': If status is PARTIAL or UNCLEAR on an important requirement, or CONFLICT on an important requirement.
   - 'minor': If status is PARTIAL or UNCLEAR on an optional requirement.
   - 'none': If status is COVERED.`;

      try {
        const matchRes = await ai.models.generateContent({
          model: modelName,
          contents: singleMatchPrompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: requirementMatchSchema,
            temperature: 0.1,
          },
        });

        const rawMatch = cleanAndParseJson<any>(matchRes.text, {});
        return validateMatchedRequirement(rawMatch, req);
      } catch (err) {
        console.warn(`Error matching requirement ${req.id}:`, err);
        // Resilient fallback
        return validateMatchedRequirement(
          {
            requirementId: req.id,
            status: 'UNCLEAR',
            proposalEvidence: 'No evidence found',
            explanation: `Verification pending for ${req.id}.`,
            severity: req.priority === 'mandatory' ? 'critical' : 'major',
          },
          req
        );
      }
    }
  );

  // =========================================================================
  // STAGE 4: Score seven official criteria from 1 to 5
  // =========================================================================
  onProgress({
    stage: 'criteria_scoring',
    label: 'Stage 4 of 7',
    message: 'Scoring official evaluation criteria (1-5) against verified evidence...',
  });

  const scoringPrompt = `You are a senior proposal scoring director.
Score the draft Proposal against the official evaluation criteria (1 to 5 scale).

OFFICIAL CRITERIA TO SCORE:
${JSON.stringify(criteriaConfig, null, 2)}

REQUIREMENT TRACEABILITY MATRIX (RTM) AUDIT FINDINGS:
${JSON.stringify(
  matchedRequirements.map((m) => ({
    id: m.requirementId,
    status: m.status,
    priority: m.priority,
    severity: m.severity,
    requirement: m.rfpRequirement,
    proposalEvidence: m.proposalEvidence,
    explanation: m.explanation,
  })),
  null,
  2
)}

RFP DOCUMENT:
"""
${rfpText}
"""

PROPOSAL DOCUMENT:
"""
${proposalText}
"""

SCORING RULES (1-5 scale):
1 = Unacceptable / Critical Failure / Direct Conflicts / Omits Core Requirements
2 = Poor / Vague / Missing Major Elements / Hidden or Deferred Costs
3 = Average / Partial / Covers Basics but Lacks Depth, Timelines, or SLAs
4 = Good / Solid / Covers Explicit Expectations with Clear Deliverables
5 = Exceptional / Thorough / Precise, Transparent, Fully Aligned with All Requirements

CRITICAL DIRECTIVES:
1. Do NOT award high scores to fluent writing if technical constraints, database rules, pricing transparency, or timeline commitments are breached or missing!
   - If there is a direct technical conflict (e.g. migrating a database when forbidden), the relevant criteria (Completeness, Scope, Problem Understanding) CANNOT score above 2.
   - If pricing is deferred or support is not priced despite being required in the base offer, Pricing Clarity MUST score 1 or 2.
   - If timeline relies on vague agile sprints without committing to mandatory pilot/rollout deadlines, Timeline Clarity MUST score 1 or 2.
2. For each criterion, cite exact quotes for positive evidence, negative evidence, and RFP citations.`;

  const criteriaResponse = await ai.models.generateContent({
    model: modelName,
    contents: scoringPrompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: criteriaScoresSchema,
      temperature: 0.1,
    },
  });

  const rawCriteriaScores = cleanAndParseJson<any[]>(criteriaResponse.text, []);
  const scoredCriteria = validateCriteriaScores(rawCriteriaScores, criteriaConfig);

  // =========================================================================
  // STAGE 5: Detect critical contradictions, missing mandatory terms, scope creep, vague pricing/timeline, and overpromising
  // =========================================================================
  onProgress({
    stage: 'issue_detection',
    label: 'Stage 5 of 7',
    message: 'Scanning for critical contradictions, scope creep, and vague commitments...',
  });

  const issueDetectionPrompt = `You are a legal and commercial risk officer for enterprise procurement.
Detect all high-impact issues, contradictions, compliance gaps, and overpromises in this Proposal.

SPECIFICALLY AUDIT FOR:
1. Critical Contradictions / RFP Conflicts: Does the proposal contradict any explicit RFP constraint (e.g., proposing database migration when the RFP strictly forbids it)?
2. Missing Mandatory Requirements: Mandatory requirements that have "No evidence found" in the proposal.
3. Vague Pricing: Hidden fees, deferred support pricing ("pricing will be provided after discovery"), or lack of transparent line-item breakdowns.
4. Vague Timeline: Evasive phrasing ("in a timely manner", "continuous sprints") lacking explicit pilot and full-rollout completion dates.
5. Scope Creep & Overpromising: Unsolicited features (e.g. experimental autonomous drones), unrealistic claims without feasibility justification.
6. Missing Support Plan: Failure to commit to required 24/7 coverage or 30-minute ticket SLA.
7. Technical Constraint Violations: Breaches of legacy infrastructure or ERP integration rules.

REQUIREMENT TRACEABILITY MATRIX AUDIT DATA:
${JSON.stringify(
  matchedRequirements.map((m) => ({
    id: m.requirementId,
    status: m.status,
    priority: m.priority,
    severity: m.severity,
    rfpEvidence: m.rfpEvidence,
    proposalEvidence: m.proposalEvidence,
    explanation: m.explanation,
  })),
  null,
  2
)}

RFP DOCUMENT:
"""
${rfpText}
"""

PROPOSAL DOCUMENT:
"""
${proposalText}
"""

RULES:
- Every issue must cite verbatim RFP Evidence and Proposal Evidence (or "No evidence found").
- Never invent evidence.`;

  const issueResponse = await ai.models.generateContent({
    model: modelName,
    contents: issueDetectionPrompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: detectedIssuesSchema,
      temperature: 0.1,
    },
  });

  const rawDetectedIssues = cleanAndParseJson<any[]>(issueResponse.text, []);
  const detectedIssues = validateDetectedIssues(rawDetectedIssues, matchedRequirements);

  // =========================================================================
  // STAGE 6: Generate specific actionable fixes & rewrites
  // =========================================================================
  onProgress({
    stage: 'actionable_fixes',
    label: 'Stage 6 of 7',
    message: 'Generating specific actionable fixes & suggested rewritten paragraphs...',
  });

  const fixPrompt = `You are an executive proposal strategist and contract negotiation coach.
Generate actionable fixes and compliant replacement paragraphs for the detected issues and requirement gaps.

CRITICAL INSTRUCTIONS:
1. Be highly specific and actionable:
   - Explain WHAT is wrong.
   - Explain WHY it matters to the evaluation committee.
   - Provide a recommended step-by-step revision command.
2. Provide a complete "suggestedRewrittenParagraph" that is ready for drop-in use in the proposal to replace the flawed text and achieve 100% compliance with the RFP.
   Do NOT generate an entire proposal from scratch! Only rewrite the specific section to eliminate the flaw and satisfy the client requirement.

DETECTED HIGH-IMPACT ISSUES:
${JSON.stringify(detectedIssues.slice(0, 8), null, 2)}

REQUIREMENT CONFLICTS & GAPS:
${JSON.stringify(
  matchedRequirements.filter((m) => m.status !== 'COVERED').map((m) => ({
    id: m.requirementId,
    status: m.status,
    requirement: m.rfpRequirement,
    proposalEvidence: m.proposalEvidence,
    fix: m.recommendedFix,
  })),
  null,
  2
)}`;

  const fixResponse = await ai.models.generateContent({
    model: modelName,
    contents: fixPrompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: actionableFixesSchema,
      temperature: 0.1,
    },
  });

  const rawFixes = cleanAndParseJson<any[]>(fixResponse.text, []);
  const actionableFixes = validateActionableFixes(rawFixes);

  // =========================================================================
  // STAGE 7: Consolidated report & overall score calculation
  // =========================================================================
  onProgress({
    stage: 'consolidation',
    label: 'Stage 7 of 7',
    message: 'Consolidating final audit report and calculating weighted overall score...',
  });

  // Requirement Statistics
  const totalReqs = matchedRequirements.length || 1;
  const coveredCount = matchedRequirements.filter((m) => m.status === 'COVERED').length;
  const partialCount = matchedRequirements.filter((m) => m.status === 'PARTIAL').length;
  const unclearCount = matchedRequirements.filter((m) => m.status === 'UNCLEAR').length;
  const missingCount = matchedRequirements.filter((m) => m.status === 'MISSING').length;
  const conflictCount = matchedRequirements.filter((m) => m.status === 'CONFLICT').length;
  const coveragePercentage = Math.round((coveredCount / totalReqs) * 100);

  // Overall Score Calculation (0-100)
  // 1. Base score from 7 weighted criteria
  const totalWeight = scoredCriteria.reduce((sum, c) => sum + (c.weight || 0), 0) || 100;
  let weightedScoreSum = 0;
  for (const c of scoredCriteria) {
    const normalizedScore = (c.score / 5) * 100;
    weightedScoreSum += normalizedScore * ((c.weight || 0) / totalWeight);
  }

  // 2. Disqualification penalties for direct conflicts and missing mandatory mandates
  const criticalConflictPenalty = conflictCount * 15;
  const missingMandatoryPenalty = matchedRequirements.filter(
    (m) => m.status === 'MISSING' && m.priority === 'mandatory'
  ).length * 10;
  const criticalIssuesCount = detectedIssues.filter((i) => i.severity === 'critical').length;
  const criticalIssuesPenalty = criticalIssuesCount > 0 ? Math.min(15, criticalIssuesCount * 5) : 0;

  let overallScore = Math.round(
    weightedScoreSum - criticalConflictPenalty - missingMandatoryPenalty - criticalIssuesPenalty
  );
  // Clamp to realistic 5-100 range
  overallScore = Math.max(5, Math.min(100, overallScore));

  // Executive summary generation
  const summaryPrompt = `Based on the following rigorous procurement audit data, write an authoritative executive summary for sales and account executives:
- Overall Score: ${overallScore}/100
- Requirement Coverage: ${coveragePercentage}% (${coveredCount}/${totalReqs} requirements covered)
- Requirement Status Breakdown: ${coveredCount} Covered, ${partialCount} Partial, ${unclearCount} Unclear, ${missingCount} Missing, ${conflictCount} Direct Conflicts
- Critical Issues Count: ${criticalIssuesCount}
- Top High-Impact Issues:
${JSON.stringify(detectedIssues.slice(0, 4), null, 2)}

Provide:
1. summary: A 2-3 paragraph authoritative executive review explaining the proposal's readiness, primary risks, and essential fixes.
2. verdict: An overall verdict: "High Risk / Non-Compliant" (if conflicts or score < 60), "Conditional Pass with Major Gaps" (if 60-79), or "Fully Compliant / Strong Proposal" (if 80+).
3. keyTakeaways: 3 to 5 clear bullet points highlighting key findings.`;

  let executiveSummaryText = 'Proposal review analysis complete.';
  try {
    const summaryResponse = await ai.models.generateContent({
      model: modelName,
      contents: summaryPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: executiveSummarySchema,
        temperature: 0.1,
      },
    });
    const parsedSummary = cleanAndParseJson<any>(summaryResponse.text, null);
    if (parsedSummary && parsedSummary.summary) {
      executiveSummaryText = parsedSummary.summary;
    }
  } catch (err) {
    console.warn('Executive summary generation fallback:', err);
  }

  const scoringWeightsUsed: Record<string, number> = {};
  scoredCriteria.forEach((c) => {
    scoringWeightsUsed[c.id] = c.weight;
  });

  return {
    overallScore,
    summary: executiveSummaryText,
    executiveSummary: executiveSummaryText,
    requirementStats: {
      total: totalReqs,
      covered: coveredCount,
      partial: partialCount,
      unclear: unclearCount,
      missing: missingCount,
      conflict: conflictCount,
      coveragePercentage,
    },
    requirements: matchedRequirements,
    scores: scoredCriteria,
    issues: detectedIssues,
    recommendations: actionableFixes,
    scoringWeightsUsed,
    analyzedAt: new Date().toISOString(),
    rfpMeta: {
      charCount: rfpText.length,
      wordCount: rfpText.trim().split(/\s+/).length,
    },
    proposalMeta: {
      charCount: proposalText.length,
      wordCount: proposalText.trim().split(/\s+/).length,
    },
  };
}
