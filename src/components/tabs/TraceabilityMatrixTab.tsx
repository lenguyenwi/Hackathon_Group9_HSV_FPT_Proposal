/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Search,
  Filter,
  FileText,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import { MatchedRequirement, RequirementStatus } from '../../types';
import { StatusBadge } from '../StatusBadge';

interface TraceabilityMatrixTabProps {
  requirements: MatchedRequirement[];
}

export const TraceabilityMatrixTab: React.FC<TraceabilityMatrixTabProps> = ({
  requirements,
}) => {
  const [filterStatus, setFilterStatus] = useState<'ALL' | RequirementStatus>('ALL');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedCsv, setCopiedCsv] = useState(false);

  const filtered = requirements.filter((req) => {
    const statusMatch = filterStatus === 'ALL' || req.status === filterStatus;
    const searchMatch =
      search.trim() === '' ||
      req.requirementId.toLowerCase().includes(search.toLowerCase()) ||
      req.rfpRequirement.toLowerCase().includes(search.toLowerCase()) ||
      req.proposalEvidence.toLowerCase().includes(search.toLowerCase()) ||
      (req.recommendedFix && req.recommendedFix.toLowerCase().includes(search.toLowerCase()));
    return statusMatch && searchMatch;
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-600 text-white shadow-2xs">
            Critical
          </span>
        );
      case 'major':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500 text-white shadow-2xs">
            Major
          </span>
        );
      case 'minor':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase bg-blue-100 text-blue-800">
            Minor
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-normal uppercase bg-slate-100 text-slate-500">
            None
          </span>
        );
    }
  };

  const handleCopyCsv = () => {
    let csv = 'Requirement ID,RFP Mandate,Status,Severity,Category,Proposal Claim,Recommended Fix\n';
    filtered.forEach((r) => {
      const escape = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;
      csv += `${escape(r.requirementId)},${escape(r.rfpRequirement)},${escape(r.status)},${escape(r.severity)},${escape(r.category)},${escape(r.proposalEvidence)},${escape(r.recommendedFix || '')}\n`;
    });
    navigator.clipboard.writeText(csv);
    setCopiedCsv(true);
    setTimeout(() => setCopiedCsv(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Requirement Traceability Matrix (RTM)</h3>
            <p className="text-xs text-slate-500">
              Interactive audit cross-referencing RFP mandates to vendor proposal claims, statuses, and corrective actions.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search matrix..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:bg-white focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses ({requirements.length})</option>
            <option value="COVERED">Covered</option>
            <option value="PARTIAL">Partial</option>
            <option value="UNCLEAR">Unclear</option>
            <option value="MISSING">Missing</option>
            <option value="CONFLICT">Conflict</option>
          </select>

          <button
            type="button"
            onClick={handleCopyCsv}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-2xs"
            title="Copy RTM as CSV"
          >
            {copiedCsv ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCsv ? 'Copied CSV' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* RTM Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 w-28">Req ID</th>
                <th className="py-3 px-4 min-w-[220px]">RFP Mandate</th>
                <th className="py-3 px-4 w-32">Status</th>
                <th className="py-3 px-4 w-24">Severity</th>
                <th className="py-3 px-4 min-w-[220px]">Proposal Claim Evidence</th>
                <th className="py-3 px-4 w-24 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => {
                const isExpanded = expandedId === item.requirementId;

                return (
                  <React.Fragment key={item.requirementId}>
                    <tr
                      onClick={() => setExpandedId(isExpanded ? null : item.requirementId)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                        item.status === 'CONFLICT'
                          ? 'bg-rose-50/20'
                          : item.status === 'MISSING'
                          ? 'bg-rose-50/10'
                          : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                        <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200">
                          {item.requirementId}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 line-clamp-2">
                          {item.rfpRequirement}
                        </div>
                        <span className="text-[10px] text-slate-400 capitalize">
                          {item.category} • {item.priority}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={item.status} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getSeverityBadge(item.severity)}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {item.proposalEvidence && item.proposalEvidence !== 'N/A' ? (
                          <div className="italic line-clamp-2 text-slate-700 font-mono text-[11px]">
                            "{item.proposalEvidence}"
                          </div>
                        ) : (
                          <span className="text-rose-500 font-medium">No verifiable claim in proposal</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          className="text-slate-400 hover:text-slate-700 p-1"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Evidence Drawer */}
                    {isExpanded && (
                      <tr className="bg-slate-50/60">
                        <td colSpan={6} className="p-5 border-t border-b border-slate-200">
                          <div className="space-y-4">
                            {/* Side by side cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Full RFP Requirement & Citation:</span>
                                </div>
                                <p className="text-xs text-slate-800 font-semibold">{item.rfpRequirement}</p>
                                <blockquote className="text-xs italic text-slate-600 bg-slate-50 p-2.5 rounded-lg border-l-2 border-indigo-400">
                                  "{item.rfpEvidence}"
                                </blockquote>
                              </div>

                              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                                  <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
                                  <span>Proposal Evidence Statement:</span>
                                </div>
                                <blockquote className="text-xs italic text-slate-700 bg-slate-50 p-2.5 rounded-lg border-l-2 border-slate-400">
                                  "{item.proposalEvidence || 'No text found'}"
                                </blockquote>
                                {item.affectedScore && (
                                  <div className="text-[11px] text-slate-500 pt-1">
                                    Affected Criterion: <strong className="text-slate-800">{item.affectedScore}</strong>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Reasoning */}
                            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700">
                              <span className="font-bold text-slate-900 block mb-0.5">Audit Evaluation:</span>
                              <p className="leading-relaxed">{item.explanation}</p>
                            </div>

                            {/* Fix */}
                            {item.recommendedFix && (
                              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start space-x-2">
                                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold block">Recommended Remediation:</span>
                                  <p className="text-slate-800 mt-0.5 leading-relaxed">{item.recommendedFix}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
