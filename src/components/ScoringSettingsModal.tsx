/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, RotateCcw, Plus, AlertCircle, CheckCircle2, Sliders } from 'lucide-react';
import { ScoringCriterionConfig } from '../types';
import { DEFAULT_SCORING_CRITERIA } from '../data/demoData';

interface ScoringSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  criteria: ScoringCriterionConfig[];
  onSave: (criteria: ScoringCriterionConfig[]) => void;
}

export const ScoringSettingsModal: React.FC<ScoringSettingsModalProps> = ({
  isOpen,
  onClose,
  criteria: initialCriteria,
  onSave,
}) => {
  const [localCriteria, setLocalCriteria] = useState<ScoringCriterionConfig[]>(initialCriteria);
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customWeight, setCustomWeight] = useState(10);
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  const totalWeight = localCriteria
    .filter((c) => c.enabled)
    .reduce((sum, c) => sum + (Number(c.weight) || 0), 0);

  const isValid = totalWeight === 100;

  const handleWeightChange = (id: string, newWeight: number) => {
    setLocalCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, weight: Math.max(0, Math.min(100, newWeight)) } : c))
    );
  };

  const handleToggle = (id: string) => {
    setLocalCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const handleReset = () => {
    setLocalCriteria(JSON.parse(JSON.stringify(DEFAULT_SCORING_CRITERIA)));
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const newCrit: ScoringCriterionConfig = {
      id: `custom_${Date.now()}`,
      name: customName.trim(),
      description: customDesc.trim() || 'Custom user-defined evaluation criterion',
      weight: customWeight,
      enabled: true,
      isCustom: true,
    };
    setLocalCriteria((prev) => [...prev, newCrit]);
    setCustomName('');
    setCustomDesc('');
    setCustomWeight(10);
    setShowAddForm(false);
  };

  const handleRemoveCustom = (id: string) => {
    setLocalCriteria((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSaveAndClose = () => {
    if (!isValid) return;
    onSave(localCriteria);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Scoring Criteria & Weight Configuration</h3>
              <p className="text-xs text-slate-500">
                Adjust criteria weights or add custom dimensions. Active weights must sum to 100%.
              </p>
            </div>
          </div>
          <button
            id="btn-close-settings-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Status summary */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              isValid
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              {isValid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              )}
              <span className="text-sm font-semibold">
                {isValid
                  ? 'Weights are balanced and equal exactly 100%'
                  : `Active weights total ${totalWeight}% (Must equal 100% to save)`}
              </span>
            </div>
            <div className="text-sm font-bold px-3 py-1 rounded-lg bg-white shadow-2xs border border-slate-200">
              {totalWeight}% / 100%
            </div>
          </div>

          {/* Criteria List */}
          <div className="space-y-3">
            {localCriteria.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  item.enabled
                    ? 'bg-white border-slate-200 shadow-2xs'
                    : 'bg-slate-50/80 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-3">
                    <input
                      id={`chk-${item.id}`}
                      type="checkbox"
                      checked={item.enabled}
                      onChange={() => handleToggle(item.id)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <label
                          htmlFor={`chk-${item.id}`}
                          className="text-sm font-semibold text-slate-900 cursor-pointer"
                        >
                          {item.name}
                        </label>
                        {item.isCustom && (
                          <span className="text-[10px] px-2 py-0.5 font-bold uppercase rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Custom
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="flex items-center space-x-1.5">
                      <input
                        id={`input-weight-${item.id}`}
                        type="number"
                        min="0"
                        max="100"
                        step="5"
                        disabled={!item.enabled}
                        value={item.weight}
                        onChange={(e) => handleWeightChange(item.id, parseInt(e.target.value) || 0)}
                        className="w-16 px-2.5 py-1.5 text-right font-semibold text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400"
                      />
                      <span className="text-sm font-bold text-slate-500">%</span>
                    </div>

                    {item.isCustom && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCustom(item.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Delete custom criterion"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Custom Criterion */}
          {showAddForm ? (
            <form onSubmit={handleAddCustom} className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">Add Custom Criterion</h4>
              <div>
                <input
                  id="input-custom-name"
                  type="text"
                  placeholder="Criterion Name (e.g. ESG & Sustainability)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <input
                  id="input-custom-desc"
                  type="text"
                  placeholder="Evaluation Prompt / Definition"
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2">
                  <label htmlFor="input-custom-weight" className="text-xs font-semibold text-slate-700">
                    Weight:
                  </label>
                  <input
                    id="input-custom-weight"
                    type="number"
                    min="1"
                    max="100"
                    step="5"
                    value={customWeight}
                    onChange={(e) => setCustomWeight(parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 text-right text-sm font-semibold border border-slate-300 rounded-lg bg-white"
                  />
                  <span className="text-xs font-semibold text-slate-500">%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs cursor-pointer"
                  >
                    Add Criterion
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <button
              id="btn-show-add-criterion"
              type="button"
              onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Criterion Dimension</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            id="btn-reset-criteria"
            type="button"
            onClick={handleReset}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset to Default (7 Criteria)</span>
          </button>

          <div className="flex items-center space-x-2.5">
            <button
              id="btn-cancel-settings"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-save-settings"
              type="button"
              onClick={handleSaveAndClose}
              disabled={!isValid}
              className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Apply Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
