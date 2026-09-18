/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  AlertOctagon,
  Search,
  Filter,
  Quote,
  ChevronDown,
  ChevronUp,
  FileText,
  FileSpreadsheet,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Tag,
} from 'lucide-react';
import { MatchedRequirement, RequirementStatus } from '../../types';
import { StatusBadge } from '../StatusBadge';

interface RequirementCoverageTabProps {
  requirements: MatchedRequirement[];
}

export const RequirementCoverageTab: React.FC<RequirementCoverageTabProps> = ({
  requirements,
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | RequirementStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set([requirements[0]?.requirementId]));
  const [copiedFixId, setCopiedFixId] = useState<string | null>(null);

  const filterOptions: { label: string; value: 'ALL' | RequirementStatus; count: number }[] = [
    { label: 'All', value: 'ALL', count: requirements.length },
    {
      label: 'Covered',
      value: 'COVERED',
      count: requirements.filter((r) => r.status === 'COVERED').length,
    },
    {
      label: 'Partial',
      value: 'PARTIAL',
      count: requirements.filter((r) => r.status === 'PARTIAL').length,
    },
    {
      label: 'Unclear',
      value: 'UNCLEAR',
      count: requirements.filter((r) => r.status === 'UNCLEAR').length,
    },
    {
      label: 'Missing',
      value: 'MISSING',
      count: requirements.filter((r) => r.status === 'MISSING').length,
    },
    {
      label: 'Conflict',
      value: 'CONFLICT',
      count: requirements.filter((r) => r.status === 'CONFLICT').length,
    },
  ];

  const filteredRequirements = requirements.filter((req) => {
    const matchesStatus = activeFilter === 'ALL' || req.status === activeFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      req.requirementId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.rfpRequirement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(filteredRequirements.map((r) => r.requirementId)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const handleCopyFix = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFixId(id);
    setTimeout(() => setCopiedFixId(null), 2500);
  };

  const getPriorityBadge = (priority: string) => {
    const p = priority?.toLowerCase();
    if (p === 'mandatory') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-50 text-rose-700 border border-rose-200">
          Mandatory
        </span>
      );
    }
    if (p === 'important') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
          Important
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase bg-slate-100 text-slate-600 border border-slate-200">
        {priority || 'Standard'}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* Controls Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setActiveFilter(opt.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeFilter === opt.value
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span>{opt.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeFilter === opt.value
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {opt.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input & Expand/Collapse Toggle */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search requirements or claims..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center space-x-1 border-l border-slate-200 pl-2">
            <button
              type="button"
              onClick={expandAll}
              className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Expand all requirement cards"
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Collapse all requirement cards"
            >
              Collapse
            </button>
          </div>
        </div>
      </div>

      {/* Requirements List */}
      {filteredRequirements.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-2">
          <Filter className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="font-bold text-slate-800">No requirements match filter criteria</h4>
          <p className="text-xs text-slate-500">Try resetting filters or modifying your search query.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequirements.map((req) => {
            const isExpanded = expandedIds.has(req.requirementId);
            const isConflict = req.status === 'CONFLICT';
            const isMissing = req.status === 'MISSING';
            const isPartial = req.status === 'PARTIAL';

            return (
              <div
                key={req.requirementId}
                className={`rounded-2xl border transition-all overflow-hidden bg-white shadow-2xs ${
                  isConflict
                    ? 'border-rose-300 ring-1 ring-rose-500/20'
                    : isMissing
                    ? 'border-rose-200'
                    : isPartial
                    ? 'border-amber-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header Summary Row */}
                <div
                  onClick={() => toggleExpand(req.requirementId)}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-start sm:items-center space-x-3 min-w-0">
                    <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                      {req.requirementId}
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900 truncate max-w-xl">
                          {req.rfpRequirement}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                        <span className="capitalize">{req.category}</span>
                        <span>•</span>
                        <span>{getPriorityBadge(req.priority)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end md:self-auto shrink-0">
                    <StatusBadge status={req.status} size="md" />
                    <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expandable Side-by-Side Evidence Panel */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-2 border-t border-slate-100 space-y-4 bg-slate-50/30">
                    {/* SIDE-BY-SIDE RFP EVIDENCE VS PROPOSAL EVIDENCE */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {/* Left: Client RFP Evidence */}
                      <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                            <FileText className="w-4 h-4 text-indigo-600" />
                            <span>Client RFP Mandate & Evidence</span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Client Requirement
                          </span>
                        </div>

                        <div className="text-xs text-slate-800 font-semibold bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          {req.rfpRequirement}
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Exact Source Citation:
                          </span>
                          <blockquote className="text-xs italic text-slate-600 bg-slate-50/60 p-3 rounded-lg border-l-2 border-indigo-500 leading-relaxed">
                            "{req.rfpEvidence || 'Section requirement mandate'}"
                          </blockquote>
                        </div>
                      </div>

                      {/* Right: Proposal Claim & Evidence */}
                      <div
                        className={`p-4 rounded-xl bg-white border space-y-2.5 shadow-2xs ${
                          isConflict
                            ? 'border-rose-300 ring-1 ring-rose-500/10'
                            : isMissing
                            ? 'border-rose-200'
                            : isPartial
                            ? 'border-amber-200'
                            : 'border-emerald-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                            <FileSpreadsheet className="w-4 h-4 text-slate-700" />
                            <span>Draft Proposal Vendor Claim</span>
                          </div>
                          <StatusBadge status={req.status} size="sm" />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Proposal Statement / Extract:
                          </span>
                          {req.proposalEvidence && req.proposalEvidence !== 'N/A' ? (
                            <blockquote
                              className={`text-xs italic p-3 rounded-lg border-l-2 leading-relaxed ${
                                isConflict
                                  ? 'bg-rose-50/70 border-rose-500 text-rose-950'
                                  : isPartial
                                  ? 'bg-amber-50/70 border-amber-500 text-amber-950'
                                  : 'bg-emerald-50/50 border-emerald-500 text-emerald-950'
                              }`}
                            >
                              "{req.proposalEvidence}"
                            </blockquote>
                          ) : (
                            <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-xs text-rose-800 font-medium flex items-center space-x-2">
                              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                              <span>No verifiable claim or commitment found in proposal text.</span>
                            </div>
                          )}
                        </div>

                        {req.affectedScore && (
                          <div className="text-[11px] text-slate-500 pt-1">
                            <span>Impacts Criterion: </span>
                            <strong className="text-slate-800 font-medium">{req.affectedScore}</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Gemini Reasoning & Audit Explanation */}
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Audit Reasoning & Gap Explanation:</span>
                      </div>
                      <p className="leading-relaxed">{req.explanation}</p>
                    </div>

                    {/* Recommended Fix Drawer if available */}
                    {req.recommendedFix && (
                      <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <span className="font-bold text-emerald-900 block">Recommended Proposal Revision:</span>
                          <p className="text-slate-800 leading-relaxed">{req.recommendedFix}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyFix(req.requirementId, req.recommendedFix || '')}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0 self-start sm:self-center"
                        >
                          {copiedFixId === req.requirementId ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Fix</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
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
