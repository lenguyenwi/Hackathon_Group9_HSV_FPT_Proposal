/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Loader2,
  Clock,
  Sparkles,
  ShieldAlert,
  Search,
  CheckSquare,
  FileSpreadsheet,
  Layers,
  Terminal,
  ArrowRight,
  Cpu,
} from 'lucide-react';
import { PipelineStageKey } from '../types';

interface ProgressPipelineProps {
  currentStage: PipelineStageKey;
  stageMessage: string;
}

interface StageInfo {
  key: PipelineStageKey;
  stepNumber: number;
  label: string;
  workflowPhase: string;
  sublabel: string;
  icon: React.ReactNode;
}

const STAGES: StageInfo[] = [
  {
    key: 'rfp_extraction',
    stepNumber: 1,
    label: 'Extract RFP Requirements',
    workflowPhase: 'RFP Ingestion',
    sublabel: 'Decomposing client text into atomic, verifiable requirements with exact quotes',
    icon: <Search className="w-4 h-4" />,
  },
  {
    key: 'proposal_claims',
    stepNumber: 2,
    label: 'Extract Proposal Claims',
    workflowPhase: 'Proposal Analysis',
    sublabel: 'Capturing vendor commitments on scope, database architecture, timeline & pricing',
    icon: <FileSpreadsheet className="w-4 h-4" />,
  },
  {
    key: 'requirement_matching',
    stepNumber: 3,
    label: 'Match Evidence & Detect Gaps',
    workflowPhase: 'Proposal Comparison',
    sublabel: 'Evaluating COVERED, PARTIAL, UNCLEAR, MISSING, and direct CONFLICT statuses',
    icon: <CheckSquare className="w-4 h-4" />,
  },
  {
    key: 'criteria_scoring',
    stepNumber: 4,
    label: 'Score 7 Core Criteria (1-5)',
    workflowPhase: 'Criteria Scoring',
    sublabel: 'Assessing Problem Understanding, Pricing, Timeline, Completeness, and Tone',
    icon: <Layers className="w-4 h-4" />,
  },
  {
    key: 'issue_detection',
    stepNumber: 5,
    label: 'Detect Risks & Contradictions',
    workflowPhase: 'Problems & Risks',
    sublabel: 'Flagging critical constraint violations, missing mandatory terms & overpromises',
    icon: <ShieldAlert className="w-4 h-4" />,
  },
  {
    key: 'actionable_fixes',
    stepNumber: 6,
    label: 'Generate Actionable Fixes',
    workflowPhase: 'Actionable Fixes',
    sublabel: 'Drafting targeted paragraph rewrites and concrete revision instructions',
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    key: 'consolidation',
    stepNumber: 7,
    label: 'Consolidate Final Audit Report',
    workflowPhase: 'Final Report',
    sublabel: 'Computing mathematically weighted overall score and executive summary',
    icon: <Clock className="w-4 h-4" />,
  },
];

export const ProgressPipeline: React.FC<ProgressPipelineProps> = ({
  currentStage,
  stageMessage,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentIndex = STAGES.findIndex((s) => s.key === currentStage);
  const currentStageIndex = currentIndex === -1 ? 0 : currentIndex;
  const progressPercent = Math.round(((currentStageIndex + 1) / STAGES.length) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      {/* Workflow Phase Visual Communicator */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
          <span>PIPELINE FLOW</span>
          <span className="font-mono text-indigo-600">RFP → Requirements → Comparison → Problems → Fixes</span>
        </div>
        <div className="flex items-center space-x-2 text-[11px] text-slate-600">
          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
            RFP Mandate
          </span>
          <span>→</span>
          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
            Atomic Extraction
          </span>
          <span>→</span>
          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
            Claim Comparison
          </span>
          <span>→</span>
          <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
            Risk Detection
          </span>
          <span>→</span>
          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
            Paragraph Fixes
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-400/20">
                <Cpu className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
                <span>Multi-Stage AI Audit Engine Active</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Auditing Proposal Compliance...
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                {stageMessage || 'Decomposing requirements and matching proposal claims in real-time'}
              </p>
            </div>

            <div className="flex items-center space-x-3 bg-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-xs shrink-0 self-start sm:self-auto border border-white/10">
              <Clock className="w-4 h-4 text-indigo-300" />
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Elapsed Time</div>
                <div className="font-mono text-sm font-bold text-white">{elapsedSeconds}s</div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative z-10 mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-200 mb-2">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Stage {currentStageIndex + 1} of {STAGES.length}: {STAGES[currentStageIndex]?.label}</span>
              </span>
              <span className="font-mono">{progressPercent}%</span>
            </div>
            <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-indigo-400 via-indigo-300 to-emerald-400 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Live log ticker */}
        <div className="px-6 py-3 bg-slate-900 text-slate-300 text-xs font-mono flex items-center space-x-2 border-b border-slate-800">
          <Terminal className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="text-indigo-400 font-bold">[Gemini 3.8 Flash]</span>
          <span className="truncate text-slate-200">{stageMessage}</span>
        </div>

        {/* Stages checklist */}
        <div className="p-6 sm:p-8 space-y-3.5">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const isPending = idx > currentStageIndex;

            return (
              <div
                key={stage.key}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  isCurrent
                    ? 'bg-indigo-50/70 border-indigo-300 shadow-sm ring-2 ring-indigo-500/20'
                    : isCompleted
                    ? 'bg-emerald-50/40 border-emerald-200/80 text-slate-800'
                    : 'bg-slate-50/40 border-slate-200/60 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-700'
                        : isCurrent
                        ? 'bg-indigo-600 text-white shadow-md animate-pulse'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : isCurrent ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      stage.icon
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        0{stage.stepNumber}
                      </span>
                      <span
                        className={`text-sm font-bold truncate ${
                          isCurrent
                            ? 'text-indigo-950'
                            : isCompleted
                            ? 'text-slate-900'
                            : 'text-slate-500'
                        }`}
                      >
                        {stage.label}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-900">
                          Active Phase
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed truncate max-w-xl">
                      {stage.sublabel}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {isCompleted && (
                    <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                      <span>Complete</span>
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-xs font-bold text-indigo-600 animate-pulse">
                      Processing...
                    </span>
                  )}
                  {isPending && (
                    <span className="text-xs text-slate-400 font-medium">Pending</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
