/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RequirementCategory =
  | 'functional'
  | 'technical'
  | 'scope'
  | 'pricing'
  | 'timeline'
  | 'support'
  | 'security'
  | 'constraint'
  | 'risk'
  | 'deliverable'
  | 'other';

export type RequirementPriority = 'mandatory' | 'important' | 'optional' | 'unknown';

export type RequirementStatus = 'COVERED' | 'PARTIAL' | 'UNCLEAR' | 'MISSING' | 'CONFLICT';

export type IssueSeverity = 'critical' | 'major' | 'minor' | 'none';

export interface RfpRequirement {
  id: string; // e.g. "REQ-001"
  category: RequirementCategory;
  title: string;
  requirement: string;
  priority: RequirementPriority;
  sourceQuote: string;
  sourceSection: string;
}

export interface ProposalClaim {
  id: string; // e.g. "PROP-001"
  category: string;
  text: string;
  sourceQuote: string;
  sourceSection: string;
}

export interface MatchedRequirement {
  requirementId: string;
  status: RequirementStatus;
  rfpRequirement: string;
  rfpEvidence: string;
  proposalEvidence: string;
  explanation: string;
  severity: IssueSeverity;
  category: RequirementCategory;
  priority: RequirementPriority;
  affectedScore?: string;
  recommendedFix?: string;
}

export interface CriterionScore {
  id: string;
  criterion: string;
  score: number; // 1 to 5
  weight: number; // percentage, e.g. 15
  reason: string;
  positiveEvidence: string[];
  negativeEvidence: string[];
  rfpCitations: string[];
  proposalCitations: string[];
}

export interface ProposalIssue {
  id: string; // e.g. "ISSUE-001"
  severity: 'critical' | 'major' | 'minor';
  type: string;
  title: string;
  description: string;
  rfpEvidence: string;
  proposalEvidence: string;
  impact: string;
  recommendedAction: string;
}

export interface ActionableFix {
  id: string;
  title: string;
  whatIsWrong: string;
  whyItMatters: string;
  relevantRfpRequirement: string;
  currentProposalText: string;
  recommendedChange: string;
  suggestedRewrittenParagraph?: string;
  category?: string;
}

export interface ScoringCriterionConfig {
  id: string;
  name: string;
  description: string;
  weight: number;
  enabled: boolean;
  isCustom?: boolean;
}

export interface ProposalAnalysisReport {
  overallScore: number;
  summary: string;
  executiveSummary: string;
  requirementStats: {
    total: number;
    covered: number;
    partial: number;
    unclear: number;
    missing: number;
    conflict: number;
    coveragePercentage: number;
  };
  requirements: MatchedRequirement[];
  scores: CriterionScore[];
  issues: ProposalIssue[];
  recommendations: ActionableFix[];
  scoringWeightsUsed: Record<string, number>;
  analyzedAt: string;
  rfpMeta: {
    charCount: number;
    wordCount: number;
    title?: string;
  };
  proposalMeta: {
    charCount: number;
    wordCount: number;
    title?: string;
  };
}

export type PipelineStageKey =
  | 'rfp_extraction'
  | 'proposal_claims'
  | 'requirement_matching'
  | 'criteria_scoring'
  | 'issue_detection'
  | 'actionable_fixes'
  | 'consolidation';

export interface PipelineStageProgress {
  stage: PipelineStageKey;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  message?: string;
}
