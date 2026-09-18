/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Star,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Quote,
  Sparkles,
  Layers,
  Scale,
  Award,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import { CriterionScore } from '../../types';

interface ScorecardTabProps {
  scores: CriterionScore[];
}

export const ScorecardTab: React.FC<ScorecardTabProps> = ({ scores }) => {
  const [expandedId, setExpandedId] = useState<string | null>(scores[0]?.id || null);

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    if (score === 3) return 'text-amber-700 bg-amber-50 border-amber-300';
    return 'text-rose-700 bg-rose-50 border-rose-300';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 4) return 'bg-emerald-500';
    if (score === 3) return 'bg-amber-400';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Seven Core Evaluation Scorecards</h3>
            <p className="text-xs text-slate-500">
              Evaluated on an objective 1 to 5 scale with verified RFP constraints and proposal claim citations.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-600 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
          <Scale className="w-4 h-4 text-indigo-600" />
          <span>Normalized 100% Weight Matrix</span>
        </div>
      </div>

      {/* Criteria Cards Accordion */}
      <div className="space-y-4">
        {scores.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all overflow-hidden bg-white shadow-2xs ${
                isExpanded
                  ? 'border-indigo-300 ring-2 ring-indigo-500/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Card Header (clickable) */}
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/40 transition-colors"
              >
                <div className="flex items-center space-x-4 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold font-mono border shrink-0 ${getScoreColor(
                      item.score
                    )}`}
                  >
                    <span className="text-lg leading-none">{item.score}</span>
                    <span className="text-[9px] uppercase font-sans text-slate-500 font-bold">/ 5</span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2.5">
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                        {item.criterion}
                      </h4>
                      {item.weight && (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {item.weight}% weight
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 truncate max-w-2xl">
                      {item.reason}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 shrink-0">
                  {/* Visual 5-segment rating block */}
                  <div className="hidden sm:flex items-center space-x-1 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <div
                        key={val}
                        className={`w-4 h-2.5 rounded-xs transition-colors ${
                          val <= item.score ? getScoreBarColor(item.score) : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </button>

              {/* Expanded Detail Panel */}
              {isExpanded && (
                <div className="px-5 pb-6 pt-2 border-t border-slate-100 bg-slate-50/40 space-y-4">
                  {/* Detailed explanation */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed space-y-1">
                    <div className="flex items-center space-x-1.5 font-bold text-slate-900 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Scoring Rationale & Evidence Justification:</span>
                    </div>
                    <p>{item.reason}</p>
                  </div>

                  {/* Positive vs Negative Evidence Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Positive Highlights */}
                    <div className="bg-white p-4 rounded-xl border border-emerald-200 space-y-2.5 shadow-2xs">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-800 border-b border-emerald-100 pb-2">
                        <div className="flex items-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Strengths & Positive Confirmations</span>
                        </div>
                        <span className="text-[10px] font-mono bg-emerald-50 px-2 py-0.5 rounded text-emerald-700 border border-emerald-200">
                          {item.positiveEvidence.length} Points
                        </span>
                      </div>

                      {item.positiveEvidence.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No explicit strengths captured.</p>
                      ) : (
                        <ul className="space-y-2">
                          {item.positiveEvidence.map((pos, idx) => (
                            <li key={idx} className="text-xs text-slate-700 flex items-start space-x-2">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                              <span className="leading-relaxed">{pos}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Identified Deficiencies */}
                    <div className="bg-white p-4 rounded-xl border border-rose-200 space-y-2.5 shadow-2xs">
                      <div className="flex items-center justify-between text-xs font-bold text-rose-800 border-b border-rose-100 pb-2">
                        <div className="flex items-center space-x-1.5">
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>Gaps, Ambiguities & Risks</span>
                        </div>
                        <span className="text-[10px] font-mono bg-rose-50 px-2 py-0.5 rounded text-rose-700 border border-rose-200">
                          {item.negativeEvidence.length} Gaps
                        </span>
                      </div>

                      {item.negativeEvidence.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No major deficiencies identified.</p>
                      ) : (
                        <ul className="space-y-2">
                          {item.negativeEvidence.map((neg, idx) => (
                            <li key={idx} className="text-xs text-slate-700 flex items-start space-x-2">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                              <span className="leading-relaxed">{neg}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Direct Citations from RFP vs Proposal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {/* RFP Citations */}
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Client RFP Citations:</span>
                      </div>
                      {item.rfpCitations && item.rfpCitations.length > 0 ? (
                        item.rfpCitations.map((c, i) => (
                          <blockquote
                            key={i}
                            className="text-xs italic text-slate-600 bg-slate-50 p-2.5 rounded-lg border-l-2 border-indigo-400"
                          >
                            "{c}"
                          </blockquote>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No specific RFP citations listed.</p>
                      )}
                    </div>

                    {/* Proposal Citations */}
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-slate-700" />
                        <span>Draft Proposal Claims:</span>
                      </div>
                      {item.proposalCitations && item.proposalCitations.length > 0 ? (
                        item.proposalCitations.map((c, i) => (
                          <blockquote
                            key={i}
                            className="text-xs italic text-slate-600 bg-slate-50 p-2.5 rounded-lg border-l-2 border-slate-400"
                          >
                            "{c}"
                          </blockquote>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No specific proposal citations listed.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
