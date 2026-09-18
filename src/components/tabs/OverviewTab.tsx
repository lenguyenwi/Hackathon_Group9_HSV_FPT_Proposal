/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Flame,
  ArrowRight,
  ShieldCheck,
  AlertOctagon,
  Sparkles,
  Award,
  Layers,
  FileSpreadsheet,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { ProposalAnalysisReport, RequirementStatus } from '../../types';
import { StatusBadge } from '../StatusBadge';

interface OverviewTabProps {
  report: ProposalAnalysisReport;
  onSelectTab: (tabIndex: number) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ report, onSelectTab }) => {
  const { overallScore, requirementStats, issues, executiveSummary, scores, requirements } = report;

  // Qualitative verdict determination
  const getScoreVerdict = (score: number) => {
    if (score >= 85) {
      return {
        label: 'High Win Probability',
        status: 'Compliant & Competitive',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-300',
        badgeColor: 'bg-emerald-500',
        desc: 'Proposal addresses nearly all mandatory and important requirements with strong evidentiary alignment.',
        winProbability: '88% - 95%',
        riskLevel: 'Low Risk',
      };
    }
    if (score >= 70) {
      return {
        label: 'Moderate Alignment / Revisions Required',
        status: 'Conditional Pass',
        color: 'text-blue-700 bg-blue-50 border-blue-300',
        badgeColor: 'bg-blue-500',
        desc: 'Solid core offering, but contains key ambiguities or omissions that must be resolved before client submission.',
        winProbability: '60% - 75%',
        riskLevel: 'Moderate Risk',
      };
    }
    if (score >= 50) {
      return {
        label: 'High Commercial Risk / Major Gaps',
        status: 'Needs Major Overhaul',
        color: 'text-amber-700 bg-amber-50 border-amber-300',
        badgeColor: 'bg-amber-500',
        desc: 'Contains significant missing requirements or vague milestones that risk client technical elimination.',
        winProbability: '30% - 45%',
        riskLevel: 'Elevated Risk',
      };
    }
    return {
      label: 'Critical Disqualification Risk',
      status: 'Blocker Detected',
      color: 'text-rose-700 bg-rose-50 border-rose-300',
      badgeColor: 'bg-rose-600',
      desc: 'Contains direct RFP contradictions or omits mandatory constraints. Unlikely to pass client technical evaluation.',
      winProbability: '< 20%',
      riskLevel: 'Severe Contract Risk',
    };
  };

  const verdict = getScoreVerdict(overallScore);
  const criticalIssues = issues.filter((i) => i.severity === 'critical');
  const majorIssues = issues.filter((i) => i.severity === 'major');
  const minorIssues = issues.filter((i) => i.severity === 'minor');

  // SVG circular gauge calculations (circumference for radius 54 is ~339.29)
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  const scoreStrokeColor =
    overallScore >= 80 ? '#10b981' : overallScore >= 60 ? '#3b82f6' : overallScore >= 45 ? '#f59e0b' : '#ef4444';

  return (
    <div className="space-y-6">
      {/* 1. CRITICAL ISSUE ALERT AREA (Priority) */}
      {criticalIssues.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border border-rose-500/40 text-white p-5 sm:p-6 shadow-lg">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center shrink-0 shadow-inner">
                <Flame className="w-6 h-6 text-rose-400 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-wider uppercase bg-rose-500 text-white shadow-xs">
                    Critical Blocker Alert
                  </span>
                  <span className="text-xs font-mono text-rose-300">
                    {criticalIssues.length} Contract Disqualifiers Detected
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  High Disqualification Risk in Proposal Draft
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                  The proposal contains direct contradictions to mandatory RFP constraints. These will trigger immediate technical rejection unless corrected before submission.
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-5">
              <div className="text-left sm:text-right">
                <span className="text-[11px] text-slate-400 block font-medium">Immediate Action:</span>
                <span className="text-xs font-bold text-rose-200">2 Rewrites Available</span>
              </div>
              <button
                type="button"
                onClick={() => onSelectTab(3)}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer hover:shadow-rose-600/20"
              >
                <span>Review Blockers</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick preview pills of the critical issues */}
          <div className="mt-4 pt-3.5 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {criticalIssues.map((iss) => (
              <div
                key={iss.id}
                onClick={() => onSelectTab(3)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-200 truncate">{iss.title}</span>
                </div>
                <span className="text-[10px] font-mono text-rose-300 shrink-0 ml-2">Fix Ready →</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. TOP METRICS GRID: Overall Score Hero Card + Coverage + Risk Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Overall Score Hero Card (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-7 rounded-3xl shadow-md border border-slate-800 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 translate-x-12 -translate-y-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Overall Compliance Score
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-white/10 text-slate-300 border border-white/10">
              100-Pt Model
            </span>
          </div>

          {/* Hero Gauge & Number Display */}
          <div className="my-6 flex items-center justify-between gap-6">
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="w-36 h-36 -rotate-90 transform" viewBox="0 0 128 128">
                {/* Track */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-slate-800"
                />
                {/* Progress arc */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  fill="none"
                  stroke={scoreStrokeColor}
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-extrabold font-mono tracking-tight text-white">
                  {overallScore}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  out of 100
                </span>
              </div>
            </div>

            <div className="space-y-2.5 flex-1 min-w-0">
              <div>
                <span
                  className={`inline-block px-2.5 py-1 rounded-lg text-xs font-extrabold border ${verdict.color}`}
                >
                  {verdict.label}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {verdict.desc}
              </p>
              <div className="pt-2 flex items-center space-x-3 text-xs text-slate-400 font-mono">
                <span>Est. Win Rate: <strong className="text-white">{verdict.winProbability}</strong></span>
              </div>
            </div>
          </div>

          {/* Scorecard quick summary pill row */}
          <div className="pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/5 rounded-xl p-2 border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Coverage</span>
              <span className="text-sm font-bold text-white font-mono">{requirementStats.coveragePercentage}%</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2 border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Blockers</span>
              <span className={`text-sm font-bold font-mono ${criticalIssues.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {criticalIssues.length}
              </span>
            </div>
            <div className="bg-white/5 rounded-xl p-2 border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Rewrites</span>
              <span className="text-sm font-bold text-indigo-300 font-mono">
                {report.recommendations.length}
              </span>
            </div>
          </div>
        </div>

        {/* Requirement Coverage & Health (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Requirement Compliance Breakdown</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribution across {requirementStats.total} atomic verifiable requirements
              </p>
            </div>

            <button
              type="button"
              onClick={() => onSelectTab(1)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
            >
              <span>Explore Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Stacked Multi-Color Segmented Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-700 font-bold">
                Overall Compliance: <span className="font-mono text-indigo-600">{requirementStats.coveragePercentage}%</span>
              </span>
              <span className="text-slate-500 text-[11px]">
                {requirementStats.covered} / {requirementStats.total} Requirements Covered
              </span>
            </div>

            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex p-0.5 border border-slate-200 shadow-inner">
              {requirementStats.covered > 0 && (
                <div
                  title={`Covered: ${requirementStats.covered}`}
                  style={{ width: `${(requirementStats.covered / requirementStats.total) * 100}%` }}
                  className="bg-emerald-500 h-full first:rounded-l-full last:rounded-r-full transition-all duration-500 hover:opacity-90"
                />
              )}
              {requirementStats.partial > 0 && (
                <div
                  title={`Partial: ${requirementStats.partial}`}
                  style={{ width: `${(requirementStats.partial / requirementStats.total) * 100}%` }}
                  className="bg-amber-400 h-full first:rounded-l-full last:rounded-r-full transition-all duration-500 hover:opacity-90"
                />
              )}
              {requirementStats.unclear > 0 && (
                <div
                  title={`Unclear: ${requirementStats.unclear}`}
                  style={{ width: `${(requirementStats.unclear / requirementStats.total) * 100}%` }}
                  className="bg-slate-400 h-full first:rounded-l-full last:rounded-r-full transition-all duration-500 hover:opacity-90"
                />
              )}
              {requirementStats.missing > 0 && (
                <div
                  title={`Missing: ${requirementStats.missing}`}
                  style={{ width: `${(requirementStats.missing / requirementStats.total) * 100}%` }}
                  className="bg-rose-400 h-full first:rounded-l-full last:rounded-r-full transition-all duration-500 hover:opacity-90"
                />
              )}
              {requirementStats.conflict > 0 && (
                <div
                  title={`Conflict: ${requirementStats.conflict}`}
                  style={{ width: `${(requirementStats.conflict / requirementStats.total) * 100}%` }}
                  className="bg-rose-900 h-full first:rounded-l-full last:rounded-r-full transition-all duration-500 hover:opacity-90"
                />
              )}
            </div>

            {/* Micro breakdown chips */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 text-center">
              <div
                onClick={() => onSelectTab(1)}
                className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-200 cursor-pointer hover:bg-emerald-50 transition-colors"
              >
                <div className="flex items-center justify-center space-x-1 text-emerald-800 font-bold text-xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Covered</span>
                </div>
                <div className="text-base font-extrabold font-mono text-emerald-900 mt-0.5">
                  {requirementStats.covered}
                </div>
              </div>

              <div
                onClick={() => onSelectTab(1)}
                className="p-2 rounded-xl bg-amber-50/60 border border-amber-200 cursor-pointer hover:bg-amber-50 transition-colors"
              >
                <div className="flex items-center justify-center space-x-1 text-amber-800 font-bold text-xs">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  <span>Partial</span>
                </div>
                <div className="text-base font-extrabold font-mono text-amber-900 mt-0.5">
                  {requirementStats.partial}
                </div>
              </div>

              <div
                onClick={() => onSelectTab(1)}
                className="p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center justify-center space-x-1 text-slate-700 font-bold text-xs">
                  <HelpCircle className="w-3 h-3 text-slate-500" />
                  <span>Unclear</span>
                </div>
                <div className="text-base font-extrabold font-mono text-slate-900 mt-0.5">
                  {requirementStats.unclear}
                </div>
              </div>

              <div
                onClick={() => onSelectTab(1)}
                className="p-2 rounded-xl bg-rose-50/60 border border-rose-200 cursor-pointer hover:bg-rose-50 transition-colors"
              >
                <div className="flex items-center justify-center space-x-1 text-rose-800 font-bold text-xs">
                  <XCircle className="w-3 h-3 text-rose-600" />
                  <span>Missing</span>
                </div>
                <div className="text-base font-extrabold font-mono text-rose-900 mt-0.5">
                  {requirementStats.missing}
                </div>
              </div>

              <div
                onClick={() => onSelectTab(1)}
                className="p-2 rounded-xl bg-rose-950 text-white border border-rose-800 cursor-pointer hover:bg-rose-900 transition-colors"
              >
                <div className="flex items-center justify-center space-x-1 text-rose-200 font-bold text-xs">
                  <AlertOctagon className="w-3 h-3 text-rose-400" />
                  <span>Conflict</span>
                </div>
                <div className="text-base font-extrabold font-mono text-white mt-0.5">
                  {requirementStats.conflict}
                </div>
              </div>
            </div>
          </div>

          {/* Quick stats footer */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <span>Mandatory Constraints: <strong className="text-slate-800">{requirements.filter(r => r.priority === 'mandatory').length} total</strong></span>
            <span>Total Identified Flaws: <strong className="text-slate-800">{issues.length} items</strong></span>
          </div>
        </div>
      </div>

      {/* 3. SEVEN-CRITERIA SCORECARDS PREVIEW */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Seven Official Evaluation Criteria</h3>
              <p className="text-xs text-slate-500">
                1 to 5 scale scoring grounded in verified client RFP and proposal evidence
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab(2)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 self-start sm:self-auto cursor-pointer"
          >
            <span>View Full Scorecard & Evidence</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 7 criteria grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          {scores.map((s) => {
            const scoreColor =
              s.score >= 4
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : s.score === 3
                ? 'text-amber-700 bg-amber-50 border-amber-200'
                : 'text-rose-700 bg-rose-50 border-rose-200';

            return (
              <div
                key={s.id}
                onClick={() => onSelectTab(2)}
                className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer bg-slate-50/40 hover:bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {s.weight}% weight
                    </span>
                    <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md border ${scoreColor}`}>
                      {s.score} / 5
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{s.criterion}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {s.reason}
                  </p>
                </div>

                {/* Mini 5-bar score indicator */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <div
                      key={val}
                      className={`h-1.5 flex-1 rounded-full ${
                        val <= s.score
                          ? s.score >= 4
                            ? 'bg-emerald-500'
                            : s.score === 3
                            ? 'bg-amber-400'
                            : 'bg-rose-500'
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Quick jump card */}
          <div
            onClick={() => onSelectTab(2)}
            className="p-4 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
          >
            <Sparkles className="w-5 h-5 text-indigo-600 mb-1" />
            <span className="text-xs font-bold text-indigo-900">Explore Citations</span>
            <span className="text-[11px] text-indigo-600">See all RFP quotes & vendor claims</span>
          </div>
        </div>
      </div>

      {/* 4. EXECUTIVE SUMMARY CARD */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">Executive Briefing & Strategic Assessment</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Gemini 3.8 Flash Analysis</span>
        </div>

        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 pt-1">
          {executiveSummary.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="leading-relaxed text-slate-700">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-4 text-xs text-slate-500">
            <span className="flex items-center space-x-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{report.recommendations.length} Rewrites Ready</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>{criticalIssues.length + majorIssues.length} Risks Flagged</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab(4)}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <span>Review Actionable Fixes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
