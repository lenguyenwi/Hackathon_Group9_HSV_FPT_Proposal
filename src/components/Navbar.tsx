/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Sliders, Play, RotateCcw, FileSearch } from 'lucide-react';

interface NavbarProps {
  onLoadDemo: () => void;
  onOpenSettings: () => void;
  onReset: () => void;
  hasResults: boolean;
  isAnalyzing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onLoadDemo,
  onOpenSettings,
  onReset,
  hasResults,
  isAnalyzing,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
            <FileSearch className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-slate-900">
                Proposal Scorer <span className="text-indigo-600">AI</span>
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Enterprise Reviewer
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Sales & Presales RFP vs Draft Proposal Compliance Auditor
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {hasResults && (
            <button
              id="btn-nav-reset"
              type="button"
              onClick={onReset}
              disabled={isAnalyzing}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
              title="Edit inputs or review another proposal"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">New Review</span>
            </button>
          )}

          <button
            id="btn-nav-demo"
            type="button"
            onClick={onLoadDemo}
            disabled={isAnalyzing}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors disabled:opacity-50 cursor-pointer"
            title="Load realistic GlobalLogix RFP & imperfect proposal"
          >
            <Play className="w-4 h-4 fill-indigo-600 text-indigo-600" />
            <span>Load Demo</span>
          </button>

          <button
            id="btn-nav-settings"
            type="button"
            onClick={onOpenSettings}
            disabled={isAnalyzing}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
            title="Configure scoring criteria weights"
          >
            <Sliders className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Scoring Settings</span>
          </button>

          <div className="hidden md:flex items-center pl-2 border-l border-slate-200">
            <span className="flex items-center space-x-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Gemini 3.8 Flash</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
