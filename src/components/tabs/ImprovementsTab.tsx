/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  ArrowRight,
  FileEdit,
  Quote,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { ActionableFix } from '../../types';

interface ImprovementsTabProps {
  recommendations: ActionableFix[];
}

export const ImprovementsTab: React.FC<ImprovementsTabProps> = ({ recommendations }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Actionable Suggested Fixes & Rewrites</h3>
            <p className="text-xs text-slate-500">
              Drop-in rewritten paragraphs generated to eliminate contract contradictions and achieve 100% compliance.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto">
          <Zap className="w-4 h-4 text-emerald-600" />
          <span>{recommendations.length} Rewrites Ready</span>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-2">
          <Check className="w-8 h-8 text-emerald-500 mx-auto" />
          <h4 className="font-bold text-slate-800">Proposal is fully compliant</h4>
          <p className="text-xs text-slate-500">No corrective text revisions required.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {recommendations.map((item, index) => {
            const isCopied = copiedId === item.id;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4 hover:border-slate-300 transition-all relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                      {item.id}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">{item.title}</h4>
                  </div>
                  {item.category && (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize self-start sm:self-auto border border-slate-200">
                      {item.category}
                    </span>
                  )}
                </div>

                {/* Problem vs Why It Matters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-200 space-y-1">
                    <span className="font-bold text-rose-900 block">Identified Flaw:</span>
                    <p className="text-rose-800 leading-relaxed">{item.whatIsWrong}</p>
                  </div>
                  <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1">
                    <span className="font-bold text-amber-900 block">Impact on Win-Rate:</span>
                    <p className="text-amber-800 leading-relaxed">{item.whyItMatters}</p>
                  </div>
                </div>

                {/* Current Proposal Text (Flawed) */}
                <div className="text-xs space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                    Current Proposal Text:
                  </span>
                  <blockquote className="font-mono text-[11px] p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 leading-relaxed line-through decoration-rose-400">
                    "{item.currentProposalText}"
                  </blockquote>
                </div>

                {/* Recommended Revision Instruction */}
                <div className="text-xs space-y-1">
                  <span className="font-bold text-indigo-950 uppercase tracking-wider text-[10px]">
                    Remediation Instruction:
                  </span>
                  <p className="text-slate-800 font-medium leading-relaxed bg-indigo-50/40 p-3 rounded-xl border border-indigo-100">
                    {item.recommendedChange}
                  </p>
                </div>

                {/* Suggested Rewritten Paragraph (Drop-in ready) */}
                {item.suggestedRewrittenParagraph && (
                  <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-50/70 to-emerald-50/30 rounded-2xl border border-emerald-300 space-y-3 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 text-xs font-extrabold text-emerald-950">
                        <FileEdit className="w-4 h-4 text-emerald-700" />
                        <span>Suggested Drop-in Replacement Paragraph:</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(item.id, item.suggestedRewrittenParagraph || '')
                        }
                        className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>Copied to Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>1-Click Copy Rewrite</span>
                          </>
                        )}
                      </button>
                    </div>

                    <blockquote className="font-mono text-xs sm:text-[13px] text-emerald-950 p-4 bg-white rounded-xl border border-emerald-200/90 leading-relaxed shadow-inner">
                      {item.suggestedRewrittenParagraph}
                    </blockquote>
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
