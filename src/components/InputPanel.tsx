/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  FileCode,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from 'lucide-react';

interface DocumentInputState {
  text: string;
  filename: string | null;
  charCount: number;
  wordCount: number;
}

interface InputPanelProps {
  rfp: DocumentInputState;
  proposal: DocumentInputState;
  onRfpChange: (newState: DocumentInputState) => void;
  onProposalChange: (newState: DocumentInputState) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onLoadDemo: () => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  rfp,
  proposal,
  onRfpChange,
  onProposalChange,
  onAnalyze,
  isAnalyzing,
  onLoadDemo,
}) => {
  const [rfpPreview, setRfpPreview] = useState(false);
  const [proposalPreview, setProposalPreview] = useState(false);
  const [isParsingRfpPdf, setIsParsingRfpPdf] = useState(false);
  const [isParsingProposalPdf, setIsParsingProposalPdf] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const rfpFileInputRef = useRef<HTMLInputElement>(null);
  const proposalFileInputRef = useRef<HTMLInputElement>(null);

  const updateDocumentState = (
    text: string,
    filename: string | null,
    setter: (val: DocumentInputState) => void
  ) => {
    const trimmed = text.trim();
    const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
    setter({
      text,
      filename,
      charCount: text.length,
      wordCount,
    });
  };

  const handleFileUpload = async (
    file: File,
    isRfp: boolean
  ) => {
    setUploadError(null);
    const setter = isRfp ? onRfpChange : onProposalChange;
    const setParsing = isRfp ? setIsParsingRfpPdf : setIsParsingProposalPdf;

    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'pdf') {
      try {
        setParsing(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const base64 = e.target?.result as string;
            const res = await fetch('/api/parse-pdf', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ base64, filename: file.name }),
            });
            const data = await res.json();
            if (data.success && data.text) {
              updateDocumentState(data.text, file.name, setter);
            } else {
              setUploadError(data.error || 'Could not parse text from PDF.');
            }
          } catch (err: any) {
            setUploadError('Failed to communicate with PDF parser: ' + err.message);
          } finally {
            setParsing(false);
          }
        };
        reader.readAsDataURL(file);
      } catch (err: any) {
        setParsing(false);
        setUploadError('Error reading PDF file: ' + err.message);
      }
    } else if (extension === 'txt' || extension === 'md' || extension === 'markdown') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = (e.target?.result as string) || '';
        updateDocumentState(text, file.name, setter);
      };
      reader.readAsText(file);
    } else {
      // Try reading as text anyway
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = (e.target?.result as string) || '';
        updateDocumentState(text, file.name, setter);
      };
      reader.readAsText(file);
    }
  };

  const isReadyToAnalyze = rfp.charCount > 20 && proposal.charCount > 20;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Intro hero banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>AI RFP-to-Proposal Compliance & Scoring Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Audit your draft proposal against client requirements
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Proposal Scorer AI extracts atomic RFP requirements, compares claims against evidence, detects missing items or direct contradictions, evaluates seven criteria, and generates actionable paragraph fixes.
          </p>
        </div>

        {/* Quick Demo CTA inside banner */}
        <div className="relative z-10 mt-5 pt-5 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Pipeline flow visualizer */}
          <div className="flex items-center space-x-2 text-[11px] text-slate-300 font-medium overflow-x-auto pb-1 md:pb-0">
            <span className="font-mono text-indigo-300 font-bold uppercase tracking-wider text-[10px]">Flow:</span>
            <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10 text-white font-semibold">1. Client RFP</span>
            <span className="text-slate-500">→</span>
            <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10 text-white font-semibold">2. Requirements</span>
            <span className="text-slate-500">→</span>
            <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10 text-white font-semibold">3. Comparison</span>
            <span className="text-slate-500">→</span>
            <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-400/30 text-rose-300 font-semibold">4. Problems</span>
            <span className="text-slate-500">→</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-semibold">5. Fixes</span>
          </div>

          <button
            id="btn-hero-load-demo"
            type="button"
            onClick={onLoadDemo}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md hover:scale-102 flex items-center space-x-2 cursor-pointer shrink-0 self-start md:self-auto"
          >
            <span>Load Demo Dataset</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-xs font-bold text-rose-700 hover:text-rose-900 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Dual Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT PANEL: Client RFP */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col h-full overflow-hidden">
          {/* Panel Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                RFP
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base">Client RFP</h2>
                <p className="text-xs text-slate-500">Request for Proposal specifications & constraints</p>
              </div>
            </div>

            {/* Document stats & tools */}
            <div className="flex items-center space-x-2">
              {rfp.charCount > 0 && (
                <button
                  id="btn-toggle-rfp-preview"
                  type="button"
                  onClick={() => setRfpPreview(!rfpPreview)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition-colors text-xs font-medium flex items-center space-x-1 cursor-pointer"
                  title={rfpPreview ? 'Collapse preview' : 'Expand full preview'}
                >
                  {rfpPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span className="hidden sm:inline">{rfpPreview ? 'Hide' : 'Preview'}</span>
                </button>
              )}

              {rfp.charCount > 0 && (
                <button
                  id="btn-clear-rfp"
                  type="button"
                  onClick={() => updateDocumentState('', null, onRfpChange)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Clear RFP text"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Metadata pill bar */}
          <div className="px-5 py-2.5 bg-slate-100/50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center space-x-3">
              {rfp.filename ? (
                <span className="inline-flex items-center space-x-1 font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="max-w-[160px] truncate">{rfp.filename}</span>
                </span>
              ) : (
                <span className="text-slate-400 italic">Pasted / Unsaved</span>
              )}
            </div>
            <div className="flex items-center space-x-3 font-mono text-[11px] text-slate-500">
              <span>{rfp.charCount.toLocaleString()} chars</span>
              <span>•</span>
              <span>{rfp.wordCount.toLocaleString()} words</span>
            </div>
          </div>

          {/* Textarea or Preview */}
          <div className="p-4 sm:p-5 flex-1 flex flex-col min-h-[360px]">
            {isParsingRfpPdf ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 p-8">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-sm font-semibold text-slate-700">Extracting text from RFP PDF...</p>
                <p className="text-xs text-slate-500">Parsing tables and sections into text</p>
              </div>
            ) : rfpPreview ? (
              <div className="flex-1 overflow-y-auto max-h-[420px] p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap font-mono leading-relaxed select-text">
                {rfp.text || 'No content entered.'}
              </div>
            ) : (
              <textarea
                id="textarea-rfp-input"
                value={rfp.text}
                onChange={(e) => updateDocumentState(e.target.value, rfp.filename, onRfpChange)}
                placeholder="Paste Client RFP text here, or drag & drop a .txt, .md, or .pdf file below..."
                className="w-full flex-1 p-3.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-normal leading-relaxed resize-none transition-all placeholder:text-slate-400"
              />
            )}

            {/* Drop / Upload zone */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <input
                ref={rfpFileInputRef}
                type="file"
                accept=".txt,.md,.markdown,.pdf,text/plain,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, true);
                  e.target.value = '';
                }}
              />
              <button
                id="btn-upload-rfp-file"
                type="button"
                onClick={() => rfpFileInputRef.current?.click()}
                className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                <span>Upload .txt / .md / .pdf</span>
              </button>

              <span className="text-[11px] text-slate-400">
                {rfp.charCount === 0 ? 'Empty document' : 'Ready for extraction'}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Proposal */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col h-full overflow-hidden">
          {/* Panel Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                PROP
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base">Draft Proposal</h2>
                <p className="text-xs text-slate-500">Vendor response claims, architecture & pricing</p>
              </div>
            </div>

            {/* Document stats & tools */}
            <div className="flex items-center space-x-2">
              {proposal.charCount > 0 && (
                <button
                  id="btn-toggle-proposal-preview"
                  type="button"
                  onClick={() => setProposalPreview(!proposalPreview)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition-colors text-xs font-medium flex items-center space-x-1 cursor-pointer"
                  title={proposalPreview ? 'Collapse preview' : 'Expand full preview'}
                >
                  {proposalPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span className="hidden sm:inline">{proposalPreview ? 'Hide' : 'Preview'}</span>
                </button>
              )}

              {proposal.charCount > 0 && (
                <button
                  id="btn-clear-proposal"
                  type="button"
                  onClick={() => updateDocumentState('', null, onProposalChange)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Clear Proposal text"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Metadata pill bar */}
          <div className="px-5 py-2.5 bg-slate-100/50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center space-x-3">
              {proposal.filename ? (
                <span className="inline-flex items-center space-x-1 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <FileCode className="w-3.5 h-3.5" />
                  <span className="max-w-[160px] truncate">{proposal.filename}</span>
                </span>
              ) : (
                <span className="text-slate-400 italic">Pasted / Unsaved</span>
              )}
            </div>
            <div className="flex items-center space-x-3 font-mono text-[11px] text-slate-500">
              <span>{proposal.charCount.toLocaleString()} chars</span>
              <span>•</span>
              <span>{proposal.wordCount.toLocaleString()} words</span>
            </div>
          </div>

          {/* Textarea or Preview */}
          <div className="p-4 sm:p-5 flex-1 flex flex-col min-h-[360px]">
            {isParsingProposalPdf ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 p-8">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                <p className="text-sm font-semibold text-slate-700">Extracting text from Proposal PDF...</p>
                <p className="text-xs text-slate-500">Parsing claims, timeline and commercials</p>
              </div>
            ) : proposalPreview ? (
              <div className="flex-1 overflow-y-auto max-h-[420px] p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap font-mono leading-relaxed select-text">
                {proposal.text || 'No content entered.'}
              </div>
            ) : (
              <textarea
                id="textarea-proposal-input"
                value={proposal.text}
                onChange={(e) => updateDocumentState(e.target.value, proposal.filename, onProposalChange)}
                placeholder="Paste vendor Proposal text here, or drag & drop a .txt, .md, or .pdf file below..."
                className="w-full flex-1 p-3.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-normal leading-relaxed resize-none transition-all placeholder:text-slate-400"
              />
            )}

            {/* Drop / Upload zone */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <input
                ref={proposalFileInputRef}
                type="file"
                accept=".txt,.md,.markdown,.pdf,text/plain,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, false);
                  e.target.value = '';
                }}
              />
              <button
                id="btn-upload-proposal-file"
                type="button"
                onClick={() => proposalFileInputRef.current?.click()}
                className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                <span>Upload .txt / .md / .pdf</span>
              </button>

              <span className="text-[11px] text-slate-400">
                {proposal.charCount === 0 ? 'Empty document' : 'Ready for extraction'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action Button Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-500 space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">Audit Protocol:</span>
            <span>7-Stage Pipeline</span>
            <span>•</span>
            <span>Source-Quote Verification</span>
            <span>•</span>
            <span>Mathematical Weighting</span>
          </div>
          <p className="text-slate-400">
            Both documents must have content before analysis can begin. Contradictions with mandatory requirements will be flagged.
          </p>
        </div>

        <button
          id="btn-analyze-proposal"
          type="button"
          onClick={onAnalyze}
          disabled={!isReadyToAnalyze || isAnalyzing}
          className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-base rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all flex items-center justify-center space-x-3 cursor-pointer shrink-0"
        >
          <Sparkles className="w-5 h-5 text-indigo-200 animate-pulse" />
          <span>Analyze Proposal</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
