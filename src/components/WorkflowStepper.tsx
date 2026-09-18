/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  FileText,
  ListOrdered,
  GitCompare,
  AlertTriangle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { ProposalAnalysisReport } from '../types';

interface WorkflowStepperProps {
  report: ProposalAnalysisReport;
  activeTab: number;
  onSelectTab: (tabIndex: number) => void;
  onEditDocuments?: () => void;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  report,
  activeTab,
  onSelectTab,
  onEditDocuments,
}) => {
  const criticalCount = report.issues.filter((i) => i.severity === 'critical').length;
  const majorCount = report.issues.filter((i) => i.severity === 'major').length;

  const steps = [
    {
      id: 'rfp',
      stepNumber: 1,
      title: 'Client RFP',
      subtitle: `${report.rfpMeta?.wordCount || 850} words`,
      icon: <FileText className="w-4 h-4" />,
      targetTab: 0,
      badge: 'Ingested',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    {
      id: 'requirements',
      stepNumber: 2,
      title: 'Atomic Requirements',
      subtitle: `${report.requirementStats.total} extracted`,
      icon: <ListOrdered className="w-4 h-4" />,
      targetTab: 1,
      badge: `${report.requirementStats.total} Reqs`,
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      id: 'comparison',
      stepNumber: 3,
      title: 'Proposal Comparison',
      subtitle: `${report.requirementStats.coveragePercentage}% matched`,
      icon: <GitCompare className="w-4 h-4" />,
      targetTab: 1,
      badge: `${report.requirementStats.covered} Covered`,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'problems',
      stepNumber: 4,
      title: 'Problems & Risks',
      subtitle: `${criticalCount} critical • ${majorCount} major`,
      icon: <AlertTriangle className="w-4 h-4" />,
      targetTab: 3,
      badge: criticalCount > 0 ? `${criticalCount} Blockers` : 'Clean',
      badgeColor: criticalCount > 0 ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'fixes',
      stepNumber: 5,
      title: 'Actionable Fixes',
      subtitle: `${report.recommendations.length} rewrites ready`,
      icon: <Sparkles className="w-4 h-4" />,
      targetTab: 4,
      badge: `${report.recommendations.length} Fixes`,
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    },
  ];

  return (
    <div className="no-print bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-2xs">
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 px-1">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            End-to-End Compliance Pipeline
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs text-slate-600 font-medium hidden sm:inline">
            RFP Extraction → Requirement Matrix → Gap Analysis → Deficiency Detection → Remediation
          </span>
        </div>
        {onEditDocuments && (
          <button
            type="button"
            onClick={onEditDocuments}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold transition-colors cursor-pointer"
          >
            Modify Inputs
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {steps.map((step, idx) => {
          const isCorrespondingTab =
            (step.id === 'rfp' && activeTab === 0) ||
            (step.id === 'requirements' && activeTab === 1) ||
            (step.id === 'comparison' && (activeTab === 1 || activeTab === 5)) ||
            (step.id === 'problems' && activeTab === 3) ||
            (step.id === 'fixes' && activeTab === 4);

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onSelectTab(step.targetTab)}
              className={`group text-left p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isCorrespondingTab
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-indigo-500/20'
                  : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/80 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isCorrespondingTab
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white border border-slate-200 text-slate-700'
                  }`}
                >
                  {step.icon}
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    isCorrespondingTab
                      ? 'bg-white/10 text-slate-200 border-white/20'
                      : step.badgeColor
                  }`}
                >
                  {step.badge}
                </span>
              </div>

              <div>
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`text-[11px] font-mono font-bold ${
                      isCorrespondingTab ? 'text-indigo-300' : 'text-slate-400'
                    }`}
                  >
                    0{step.stepNumber}
                  </span>
                  <span
                    className={`text-xs font-bold leading-tight truncate ${
                      isCorrespondingTab ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                <p
                  className={`text-[11px] mt-0.5 truncate ${
                    isCorrespondingTab ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {step.subtitle}
                </p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 pointer-events-none">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
