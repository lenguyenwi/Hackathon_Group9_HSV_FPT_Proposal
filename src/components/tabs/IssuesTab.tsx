/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Flame,
  AlertTriangle,
  Info,
  Quote,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertOctagon,
  FileText,
  FileSpreadsheet,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ProposalIssue } from '../../types';

interface IssuesTabProps {
  issues: ProposalIssue[];
}

export const IssuesTab: React.FC<IssuesTabProps> = ({ issues }) => {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'critical' | 'major' | 'minor'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(issues[0]?.id || null);

  const criticalIssues = issues.filter((i) => i.severity === 'critical');
  const majorIssues = issues.filter((i) => i.severity === 'major');
  const minorIssues = issues.filter((i) => i.severity === 'minor');

  const filteredIssues =
    filterSeverity === 'ALL'
      ? issues
      : issues.filter((i) => i.severity === filterSeverity);

  return (
    <div className="space-y-6">
      {/* Critical Issue Callout Banner if critical blockers exist */}
      {criticalIssues.length > 0 && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-xs shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm text-rose-900 uppercase tracking-wide">
                  High Disqualification Alert
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200/80 text-rose-900">
                  {criticalIssues.length} Critical
                </span>
              </div>
              <p className="text-xs text-rose-800 mt-1 leading-relaxed max-w-3xl">
                These contract contradictions represent mandatory client terms violated in the draft proposal. Resolving these is required before proposal sign-off.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFilterSeverity('critical')}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs self-start sm:self-center"
          >
            Filter Critical Only
          </button>
        </div>
      )}

      {/* Header controls & filter chips */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Identified Proposal Deficiencies</h3>
          <p className="text-xs text-slate-500">
            Categorized by risk level, commercial impact, and contractual violation severity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterSeverity('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterSeverity === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({issues.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterSeverity('critical')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
              filterSeverity === 'critical'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Critical ({criticalIssues.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterSeverity('major')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
              filterSeverity === 'major'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Major ({majorIssues.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterSeverity('minor')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterSeverity === 'minor'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            Minor ({minorIssues.length})
          </button>
        </div>
      </div>

      {filteredIssues.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <h4 className="font-bold text-slate-800">No issues found in this category</h4>
          <p className="text-xs text-slate-500">The proposal does not have active flaws with this severity level.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIssues.map((issue) => {
            const isCritical = issue.severity === 'critical';
            const isMajor = issue.severity === 'major';
            const isExpanded = expandedId === issue.id;

            return (
              <div
                key={issue.id}
                className={`rounded-2xl border transition-all overflow-hidden bg-white shadow-2xs ${
                  isCritical
                    ? 'border-rose-300 ring-1 ring-rose-500/20'
                    : isMajor
                    ? 'border-amber-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header (clickable) */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : issue.id)}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isCritical
                      ? 'bg-rose-50/40 hover:bg-rose-50/70'
                      : isMajor
                      ? 'bg-amber-50/30 hover:bg-amber-50/60'
                      : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wide shrink-0 ${
                        isCritical
                          ? 'bg-rose-600 text-white'
                          : isMajor
                          ? 'bg-amber-500 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {isCritical ? (
                        <Flame className="w-3.5 h-3.5" />
                      ) : isMajor ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : (
                        <Info className="w-3.5 h-3.5" />
                      )}
                      <span>{issue.severity}</span>
                    </span>

                    <span className="font-mono text-xs font-bold text-slate-400 shrink-0">
                      {issue.id}
                    </span>

                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{issue.title}</h4>
                      <span className="text-xs text-slate-500 capitalize">{issue.type} issue</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-auto shrink-0">
                    <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">
                      {isExpanded ? 'Collapse' : 'View Evidence'}
                    </span>
                    <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 border-t border-slate-100 space-y-4 bg-slate-50/30">
                    {/* Description */}
                    <div className="text-xs text-slate-800 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
                      <strong className="text-slate-900 block mb-1">Deficiency Description:</strong>
                      {issue.description}
                    </div>

                    {/* SIDE-BY-SIDE RFP EVIDENCE VS PROPOSAL EVIDENCE */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* RFP Mandate */}
                      <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                          <FileText className="w-4 h-4 text-indigo-600" />
                          <span>Client RFP Requirement & Mandate:</span>
                        </div>
                        <blockquote className="text-xs italic text-slate-700 bg-slate-50 p-3 rounded-lg border-l-2 border-indigo-500 leading-relaxed font-mono text-[11px]">
                          "{issue.rfpEvidence}"
                        </blockquote>
                      </div>

                      {/* Proposal Text */}
                      <div
                        className={`p-4 rounded-xl bg-white border space-y-2 shadow-2xs ${
                          isCritical ? 'border-rose-200' : 'border-amber-200'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                          <FileSpreadsheet className="w-4 h-4 text-rose-600" />
                          <span>Draft Proposal Contradiction / Statement:</span>
                        </div>
                        <blockquote
                          className={`text-xs italic p-3 rounded-lg border-l-2 leading-relaxed font-mono text-[11px] ${
                            isCritical
                              ? 'bg-rose-50/70 border-rose-500 text-rose-950'
                              : 'bg-amber-50/70 border-amber-500 text-amber-950'
                          }`}
                        >
                          "{issue.proposalEvidence}"
                        </blockquote>
                      </div>
                    </div>

                    {/* Impact vs Action Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-200 space-y-1">
                        <span className="font-bold text-rose-900 block">Commercial & Evaluation Impact:</span>
                        <p className="text-rose-800 leading-relaxed">{issue.impact}</p>
                      </div>

                      <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1">
                        <span className="font-bold text-emerald-900 block">Recommended Resolution Action:</span>
                        <p className="text-emerald-800 leading-relaxed">{issue.recommendedAction}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
