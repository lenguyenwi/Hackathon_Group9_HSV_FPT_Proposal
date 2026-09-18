/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Type } from '@google/genai';

/**
 * Stage 1 Schema: Atomic RFP Requirements Extraction
 */
export const rfpRequirementsSchema = {
  type: Type.ARRAY,
  description: 'List of atomic, verifiable requirements extracted from the RFP text.',
  items: {
    type: Type.OBJECT,
    properties: {
      id: {
        type: Type.STRING,
        description: 'Unique requirement identifier, e.g. REQ-01, REQ-02, REQ-03',
      },
      category: {
        type: Type.STRING,
        enum: [
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
        ],
        description: 'Category of the requirement',
      },
      title: {
        type: Type.STRING,
        description: 'Short concise title of the requirement',
      },
      requirement: {
        type: Type.STRING,
        description: 'Atomic, unambiguous statement of what the client requires',
      },
      priority: {
        type: Type.STRING,
        enum: ['mandatory', 'important', 'optional', 'unknown'],
        description: 'Priority: mandatory (must/shall/critical/strict constraint), important (should/expected), optional (bonus/nice-to-have), unknown',
      },
      sourceQuote: {
        type: Type.STRING,
        description: 'Verbatim quote from the RFP text containing this requirement',
      },
      sourceSection: {
        type: Type.STRING,
        description: 'RFP section or heading where this requirement appears',
      },
    },
    required: ['id', 'category', 'title', 'requirement', 'priority', 'sourceQuote', 'sourceSection'],
  },
};

/**
 * Stage 2 Schema: Proposal Commitments and Claims Extraction
 */
export const proposalClaimsSchema = {
  type: Type.ARRAY,
  description: 'List of specific commitments, scope statements, architecture decisions, commercial figures, timelines, and bonus items extracted from the Proposal.',
  items: {
    type: Type.OBJECT,
    properties: {
      id: {
        type: Type.STRING,
        description: 'Claim identifier, e.g. PROP-01, PROP-02',
      },
      category: {
        type: Type.STRING,
        enum: [
          'technical',
          'scope',
          'timeline',
          'pricing',
          'support',
          'architecture',
          'risk',
          'governance',
          'bonus',
        ],
        description: 'Category of the proposal commitment',
      },
      topic: {
        type: Type.STRING,
        description: 'Specific subject, e.g. Database Strategy, Pilot Timeline, Pricing Structure, Support SLA',
      },
      text: {
        type: Type.STRING,
        description: 'Clear description of vendor commitment, scope, figure, or stance',
      },
      sourceQuote: {
        type: Type.STRING,
        description: 'Verbatim quote from the proposal text supporting this claim',
      },
      sourceSection: {
        type: Type.STRING,
        description: 'Proposal section or heading name',
      },
    },
    required: ['id', 'category', 'topic', 'text', 'sourceQuote', 'sourceSection'],
  },
};

/**
 * Stage 3 Schema: Single RFP Requirement Match & Classification
 */
export const requirementMatchSchema = {
  type: Type.OBJECT,
  description: 'Rigorous compliance evaluation of a single RFP requirement against the proposal evidence.',
  properties: {
    requirementId: {
      type: Type.STRING,
      description: 'The ID of the evaluated requirement',
    },
    status: {
      type: Type.STRING,
      enum: ['COVERED', 'PARTIAL', 'UNCLEAR', 'MISSING', 'CONFLICT'],
      description: 'Compliance status: COVERED (fully met with concrete evidence), PARTIAL (addressed but incomplete/omits details), UNCLEAR (vague, aspirational, lacks concrete dates/SLAs), MISSING (no evidence in proposal), CONFLICT (contradicts, violates, or breaches RFP mandate)',
    },
    rfpRequirement: {
      type: Type.STRING,
      description: 'Requirement statement being evaluated',
    },
    rfpEvidence: {
      type: Type.STRING,
      description: 'Verbatim quote from RFP establishing the requirement',
    },
    proposalEvidence: {
      type: Type.STRING,
      description: 'Verbatim quote from Proposal demonstrating coverage or contradiction. If missing, MUST BE EXACTLY "No evidence found".',
    },
    explanation: {
      type: Type.STRING,
      description: 'Detailed, objective auditor rationale explaining this status',
    },
    severity: {
      type: Type.STRING,
      enum: ['critical', 'major', 'minor', 'none'],
      description: 'critical (disqualifying conflict or missing mandatory requirement), major (partial or unclear on important item), minor (small detail or optional item), none (well covered)',
    },
    affectedScore: {
      type: Type.STRING,
      description: 'Which criterion this primarily affects (e.g. Scope, Pricing Clarity, Timeline Clarity, Completeness)',
    },
    recommendedFix: {
      type: Type.STRING,
      description: 'Specific, actionable step needed to make this 100% compliant',
    },
  },
  required: [
    'requirementId',
    'status',
    'rfpRequirement',
    'rfpEvidence',
    'proposalEvidence',
    'explanation',
    'severity',
    'affectedScore',
    'recommendedFix',
  ],
};

/**
 * Stage 4 Schema: Seven Core Criteria Scoring (1-5)
 */
export const criteriaScoresSchema = {
  type: Type.ARRAY,
  description: 'Scorecards for the seven official proposal evaluation criteria.',
  items: {
    type: Type.OBJECT,
    properties: {
      id: {
        type: Type.STRING,
        description: 'Criterion identifier matching the configuration (e.g. problem_understanding, pricing_clarity)',
      },
      criterion: {
        type: Type.STRING,
        description: 'Criterion display name',
      },
      score: {
        type: Type.INTEGER,
        description: 'Objective score from 1 (unacceptable/conflict/critical failure) to 5 (exceptional/thorough/fully verified)',
      },
      reason: {
        type: Type.STRING,
        description: 'Evidence-based justification for this score',
      },
      positiveEvidence: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Specific verified strengths or positive commitments in proposal',
      },
      negativeEvidence: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Specific deficiencies, gaps, ambiguities, or contract contradictions',
      },
      rfpCitations: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Relevant verbatim quotes from the RFP',
      },
      proposalCitations: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Relevant verbatim quotes from the Proposal (or "No evidence found")',
      },
    },
    required: [
      'id',
      'criterion',
      'score',
      'reason',
      'positiveEvidence',
      'negativeEvidence',
      'rfpCitations',
      'proposalCitations',
    ],
  },
};

/**
 * Stage 5 Schema: Issues, Contradictions & Risk Detection
 */
export const detectedIssuesSchema = {
  type: Type.ARRAY,
  description: 'List of high-impact proposal risks, contradictions, and deficiencies.',
  items: {
    type: Type.OBJECT,
    properties: {
      id: {
        type: Type.STRING,
        description: 'Unique issue ID, e.g. ISSUE-01, ISSUE-02',
      },
      severity: {
        type: Type.STRING,
        enum: ['critical', 'major', 'minor'],
        description: 'critical (disqualifying constraint breaches or missing mandatory terms), major (substantial omissions/vague terms), minor (small discrepancies)',
      },
      type: {
        type: Type.STRING,
        description: 'Issue classification: Critical Contradiction | Missing Mandatory Requirement | Vague Pricing | Vague Timeline | Scope Creep & Overpromising | Missing Support Plan | Technical Constraint Violation | Risk & Assumption Gap',
      },
      title: {
        type: Type.STRING,
        description: 'Concise, hard-hitting title describing the flaw',
      },
      description: {
        type: Type.STRING,
        description: 'Detailed objective breakdown of why this is a risk',
      },
      rfpEvidence: {
        type: Type.STRING,
        description: 'Verbatim quote from the RFP establishing the mandate',
      },
      proposalEvidence: {
        type: Type.STRING,
        description: 'Verbatim quote from the Proposal showing the contradiction/vagueness, or strictly "No evidence found"',
      },
      impact: {
        type: Type.STRING,
        description: 'Impact on evaluation score, legal compliance, or win probability',
      },
      recommendedAction: {
        type: Type.STRING,
        description: 'Direct instruction on how the proposal team must resolve this deficiency',
      },
    },
    required: [
      'id',
      'severity',
      'type',
      'title',
      'description',
      'rfpEvidence',
      'proposalEvidence',
      'impact',
      'recommendedAction',
    ],
  },
};

/**
 * Stage 6 Schema: Actionable Fixes & Rewrites
 */
export const actionableFixesSchema = {
  type: Type.ARRAY,
  description: 'Actionable revision instructions and drop-in replacement paragraphs.',
  items: {
    type: Type.OBJECT,
    properties: {
      id: {
        type: Type.STRING,
        description: 'Fix identifier, e.g. FIX-01, FIX-02',
      },
      title: {
        type: Type.STRING,
        description: 'Title of the fix',
      },
      category: {
        type: Type.STRING,
        description: 'Category: Architecture | Commercials | Timeline | Support | Governance | Scope',
      },
      whatIsWrong: {
        type: Type.STRING,
        description: 'Exact statement of the defect or contradiction',
      },
      whyItMatters: {
        type: Type.STRING,
        description: 'Consequence on evaluation scoring and procurement disqualification',
      },
      relevantRfpRequirement: {
        type: Type.STRING,
        description: 'Verbatim RFP requirement and citation',
      },
      currentProposalText: {
        type: Type.STRING,
        description: 'Verbatim flawed quote from proposal, or "No evidence found in proposal"',
      },
      recommendedChange: {
        type: Type.STRING,
        description: 'Specific step-by-step instruction on what to revise',
      },
      suggestedRewrittenParagraph: {
        type: Type.STRING,
        description: 'Complete, drop-in replacement paragraph that is 100% compliant with the RFP mandate',
      },
    },
    required: [
      'id',
      'title',
      'category',
      'whatIsWrong',
      'whyItMatters',
      'relevantRfpRequirement',
      'currentProposalText',
      'recommendedChange',
      'suggestedRewrittenParagraph',
    ],
  },
};

/**
 * Stage 7 Schema: Executive Summary Assessment
 */
export const executiveSummarySchema = {
  type: Type.OBJECT,
  description: 'Executive summary assessment for sales leadership.',
  properties: {
    summary: {
      type: Type.STRING,
      description: 'Concise, authoritative 2-3 paragraph executive review summary highlighting readiness, key disqualification risks, and path to compliance.',
    },
    verdict: {
      type: Type.STRING,
      description: 'Overall executive evaluation verdict (e.g. High Disqualification Risk - Do Not Submit, Conditional Pass with Gaps, Fully Compliant)',
    },
    keyTakeaways: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '3-5 high-level bullet points summarizing the most critical audit findings',
    },
  },
  required: ['summary', 'verdict', 'keyTakeaways'],
};
