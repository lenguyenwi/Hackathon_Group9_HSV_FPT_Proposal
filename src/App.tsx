/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { InputPanel } from './components/InputPanel';
import { ProgressPipeline } from './components/ProgressPipeline';
import { Dashboard } from './components/Dashboard';
import { ScoringSettingsModal } from './components/ScoringSettingsModal';
import {
  DEFAULT_RFP_TEXT,
  DEFAULT_PROPOSAL_TEXT,
  DEFAULT_SCORING_CRITERIA,
} from './data/demoData';
import {
  PipelineStageKey,
  ProposalAnalysisReport,
  ScoringCriterionConfig,
} from './types';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface DocumentInputState {
  text: string;
  filename: string | null;
  charCount: number;
  wordCount: number;
}

export default function App() {
  const [rfp, setRfp] = useState<DocumentInputState>({
    text: '',
    filename: null,
    charCount: 0,
    wordCount: 0,
  });

  const [proposal, setProposal] = useState<DocumentInputState>({
    text: '',
    filename: null,
    charCount: 0,
    wordCount: 0,
  });

  const [criteria, setCriteria] = useState<ScoringCriterionConfig[]>(
    DEFAULT_SCORING_CRITERIA
  );

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStage, setCurrentStage] = useState<PipelineStageKey>('rfp_extraction');
  const [stageMessage, setStageMessage] = useState('Initializing audit pipeline...');
  const [report, setReport] = useState<ProposalAnalysisReport | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Load realistic demo data
  const handleLoadDemo = () => {
    const rfpWords = DEFAULT_RFP_TEXT.trim().split(/\s+/).length;
    const propWords = DEFAULT_PROPOSAL_TEXT.trim().split(/\s+/).length;

    setRfp({
      text: DEFAULT_RFP_TEXT,
      filename: 'GlobalLogix_RFP_Warehouse_ERP_2025.txt',
      charCount: DEFAULT_RFP_TEXT.length,
      wordCount: rfpWords,
    });

    setProposal({
      text: DEFAULT_PROPOSAL_TEXT,
      filename: 'ApexSolutions_Draft_Proposal_v1.0.txt',
      charCount: DEFAULT_PROPOSAL_TEXT.length,
      wordCount: propWords,
    });

    setAnalysisError(null);
  };

  // Reset to initial state
  const handleReset = () => {
    if (isAnalyzing) return;
    setReport(null);
    setAnalysisError(null);
  };

  // Start multi-stage analysis via SSE
  const handleAnalyze = async () => {
    if (!rfp.text.trim() || !proposal.text.trim()) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setCurrentStage('rfp_extraction');
    setStageMessage('Reading RFP and extracting atomic verifiable requirements...');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rfpText: rfp.text,
          proposalText: proposal.text,
          scoringCriteria: criteria.filter((c) => c.enabled),
        }),
      });

      if (!response.ok) {
        let errMessage = `HTTP error ${response.status}`;
        try {
          const errData = await response.json();
          if (errData.error) errMessage = errData.error;
        } catch {
          // ignore
        }
        throw new Error(errMessage);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Server response stream is not readable.');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const jsonStr = trimmed.slice(6);
            if (!jsonStr) continue;

            try {
              const payload = JSON.parse(jsonStr);

              if (payload.type === 'stage') {
                setCurrentStage(payload.stage);
                setStageMessage(payload.message);
              } else if (payload.type === 'complete') {
                setReport(payload.report);
                setIsAnalyzing(false);
              } else if (payload.type === 'error') {
                throw new Error(payload.error || 'Pipeline execution failed on server.');
              }
            } catch (err: any) {
              if (err.message && !err.message.includes('JSON.parse')) {
                throw err;
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setAnalysisError(err.message || 'An unexpected error occurred during proposal analysis.');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navigation */}
      <Navbar
        onLoadDemo={handleLoadDemo}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onReset={handleReset}
        hasResults={!!report}
        isAnalyzing={isAnalyzing}
      />

      {/* Main Workspace Area */}
      <main className="flex-1">
        {/* Error notification banner */}
        {analysisError && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start justify-between gap-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Analysis Pipeline Error</h4>
                  <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{analysisError}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAnalysisError(null)}
                  className="px-2 py-1 text-xs text-rose-600 hover:text-rose-800 font-medium cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Switcher: Progress, Dashboard, or Input */}
        {isAnalyzing ? (
          <ProgressPipeline
            currentStage={currentStage}
            stageMessage={stageMessage}
          />
        ) : report ? (
          <Dashboard
            report={report}
            onEditDocuments={() => setReport(null)}
            onReset={handleReset}
          />
        ) : (
          <InputPanel
            rfp={rfp}
            proposal={proposal}
            onRfpChange={setRfp}
            onProposalChange={setProposal}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            onLoadDemo={handleLoadDemo}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Proposal Scorer AI • Enterprise RFP vs Draft Proposal Compliance Auditor</span>
          <span className="text-slate-400">Powered by Gemini 3.8 Flash multi-stage reasoning</span>
        </div>
      </footer>

      {/* Scoring Settings Modal */}
      <ScoringSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        criteria={criteria}
        onSave={(updated) => setCriteria(updated)}
      />
    </div>
  );
}

