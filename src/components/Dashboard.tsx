/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Award,
  ShieldAlert,
  Sparkles,
  FileSpreadsheet,
  Copy,
  Download,
  Printer,
  Edit3,
  Check,
  RotateCcw,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { ProposalAnalysisReport } from '../types';
import { WorkflowStepper } from './WorkflowStepper';
import { OverviewTab } from './tabs/OverviewTab';
import { RequirementCoverageTab } from './tabs/RequirementCoverageTab';
import { ScorecardTab } from './tabs/ScorecardTab';
import { IssuesTab } from './tabs/IssuesTab';
import { ImprovementsTab } from './tabs/ImprovementsTab';
import { TraceabilityMatrixTab } from './tabs/TraceabilityMatrixTab';

interface DashboardProps {
  report: ProposalAnalysisReport;
  onEditDocuments: () => void;
  onReset: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  report,
  onEditDocuments,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [copiedReport, setCopiedReport] = useState(false);

  const criticalIssuesCount = report.issues.filter((i) => i.severity === 'critical').length;

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'coverage',
      label: `Requirement Coverage`,
      badge: `${report.requirementStats.coveragePercentage}%`,
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: <CheckSquare className="w-4 h-4" />,
    },
    {
      id: 'scorecard',
      label: '7-Criteria Scorecards',
      badge: '1-5 Scale',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: <Award className="w-4 h-4" />,
    },
    {
      id: 'issues',
      label: `Issues & Deficiencies`,
      badge: `${report.issues.length}`,
      badgeColor:
        criticalIssuesCount > 0
          ? 'bg-rose-100 text-rose-800 border-rose-300'
          : 'bg-slate-100 text-slate-700 border-slate-200',
      icon: <ShieldAlert className="w-4 h-4" />,
    },
    {
      id: 'fixes',
      label: `Suggested Fixes`,
      badge: `${report.recommendations.length}`,
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'matrix',
      label: 'Traceability Matrix',
      icon: <FileSpreadsheet className="w-4 h-4" />,
    },
  ];

  // Copy Full Markdown Report to Clipboard
  const handleCopyReport = () => {
    let md = `# PROPOSAL SCORER AI - EXECUTIVE AUDIT REPORT\n\n`;
    md += `**Overall Score:** ${report.overallScore} / 100\n`;
    md += `**Requirement Coverage:** ${report.requirementStats.coveragePercentage}% (${report.requirementStats.covered}/${report.requirementStats.total} covered)\n`;
    md += `**Audited At:** ${new Date(report.analyzedAt).toLocaleString()}\n\n`;

    md += `## 1. Executive Summary\n${report.executiveSummary}\n\n`;

    md += `## 2. Seven Official Criteria Scores\n`;
    report.scores.forEach((s) => {
      md += `- **${s.criterion}**: ${s.score}/5 (${s.weight}% weight)\n  *Reason:* ${s.reason}\n`;
    });
    md += `\n`;

    md += `## 3. High-Impact Issues\n`;
    report.issues.forEach((iss) => {
      md += `### [${iss.severity.toUpperCase()}] ${iss.title} (${iss.id})\n`;
      md += `- **Type:** ${iss.type}\n`;
      md += `- **RFP Evidence:** "${iss.rfpEvidence}"\n`;
      md += `- **Proposal Evidence:** "${iss.proposalEvidence}"\n`;
      md += `- **Impact:** ${iss.impact}\n`;
      md += `- **Recommended Action:** ${iss.recommendedAction}\n\n`;
    });

    md += `## 4. Actionable Improvements & Rewrites\n`;
    report.recommendations.forEach((rec) => {
      md += `### ${rec.title} (${rec.id})\n`;
      md += `- **Current Proposal Text:** "${rec.currentProposalText}"\n`;
      md += `- **Problem:** ${rec.whatIsWrong}\n`;
      md += `- **Recommended Change:** ${rec.recommendedChange}\n`;
      if (rec.suggestedRewrittenParagraph) {
        md += `- **Suggested Rewritten Paragraph:**\n> ${rec.suggestedRewrittenParagraph}\n`;
      }
      md += `\n`;
    });

    md += `## 5. Requirement Traceability Matrix\n`;
    md += `| Req ID | Requirement | Status | Severity | Proposal Evidence | Fix |\n`;
    md += `|---|---|---|---|---|---|\n`;
    report.requirements.forEach((r) => {
      md += `| ${r.requirementId} | ${r.rfpRequirement.replace(/\|/g, '-')} | ${r.status} | ${r.severity} | ${r.proposalEvidence.replace(/\|/g, '-')} | ${r.recommendedFix?.replace(/\|/g, '-') || 'N/A'} |\n`;
    });

    navigator.clipboard.writeText(md);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  // Export JSON file download
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `proposal-scorer-audit-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Print / Save as PDF
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="no-print bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Audit Completed • GlobalLogix ERP RFP vs Apex Proposal
            </h2>
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              ({new Date(report.analyzedAt).toLocaleTimeString()})
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Full compliance audit completed across {report.requirementStats.total} atomic RFP requirements with Gemini 3.8 Flash.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-edit-documents"
            type="button"
            onClick={onEditDocuments}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
            title="Edit input texts"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Inputs</span>
          </button>

          <button
            id="btn-copy-report"
            type="button"
            onClick={handleCopyReport}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
            title="Copy entire executive audit report as markdown"
          >
            {copiedReport ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Report Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Report</span>
              </>
            )}
          </button>

          <button
            id="btn-export-json"
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
            title="Download audit JSON dataset"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export JSON</span>
          </button>

          <button
            id="btn-print"
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
            title="Print or export as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>

          <button
            id="btn-reset-results"
            type="button"
            onClick={onReset}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            title="Start new audit"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Audit</span>
          </button>
        </div>
      </div>

      {/* Visual Workflow Stepper: RFP → Requirements → Proposal Comparison → Problems → Fixes */}
      <WorkflowStepper
        report={report}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onEditDocuments={onEditDocuments}
      />

      {/* Main Tab Navigation */}
      <div className="no-print bg-white rounded-2xl border border-slate-200 p-1.5 shadow-2xs">
        <nav className="flex flex-wrap items-center gap-1">
          {tabs.map((tab, idx) => {
            const isActive = activeTab === idx;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.2 rounded-full border ${
                      isActive
                        ? 'bg-white/20 text-white border-white/20'
                        : tab.badgeColor
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Active Tab View */}
      <div className="tab-content transition-all duration-300">
        {activeTab === 0 && (
          <OverviewTab
            report={report}
            onSelectTab={(tabIdx) => setActiveTab(tabIdx)}
          />
        )}
        {activeTab === 1 && (
          <RequirementCoverageTab requirements={report.requirements} />
        )}
        {activeTab === 2 && <ScorecardTab scores={report.scores} />}
        {activeTab === 3 && <IssuesTab issues={report.issues} />}
        {activeTab === 4 && (
          <ImprovementsTab recommendations={report.recommendations} />
        )}
        {activeTab === 5 && (
          <TraceabilityMatrixTab requirements={report.requirements} />
        )}
      </div>
    </div>
  );
};
