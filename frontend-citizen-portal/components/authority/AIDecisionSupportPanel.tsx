'use client';

import React, { useEffect, useState } from 'react';
import { aiService, AIAdvisoryResponse, AIModelStatus } from '@/services/aiService';

export const AIDecisionSupportPanel: React.FC = () => {
  const [modelStatus, setModelStatus] = useState<AIModelStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'risk' | 'relocation' | 'classify'>('risk');

  // Risk Assessment Form
  const [habitationId, setHabitationId] = useState('PATAMATA-EAST-01');
  const [population, setPopulation] = useState(1200);
  const [vulnerablePop, setVulnerablePop] = useState(250);
  const [hazardSeverity, setHazardSeverity] = useState(0.85);
  const [hazardIntersect, setHazardIntersect] = useState(true);
  const [roadAccess, setRoadAccess] = useState(0.35);
  const [shelterCapacity, setShelterCapacity] = useState(400);
  const [relocationDemand, setRelocationDemand] = useState(500);

  // Report Classification Form
  const [reportId, setReportId] = useState('REP-1049');
  const [reportText, setReportText] = useState('MG Road underpass is severely flooded with 4 feet of standing water. Completely blocked for vehicles.');
  const [nearbyHazard, setNearbyHazard] = useState(true);

  // Result state
  const [result, setResult] = useState<AIAdvisoryResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    aiService.getModelStatus().then(setModelStatus).catch(() => {});
  }, []);

  const handleRunRiskAssessment = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await aiService.assessRisk({
        habitation_id: habitationId,
        population,
        vulnerable_population: vulnerablePop,
        hazard_severity: hazardSeverity,
        hazard_zone_intersection: hazardIntersect,
        road_accessibility: roadAccess,
        available_shelter_capacity: shelterCapacity,
        estimated_relocation_demand: relocationDemand,
      });
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to assess risk');
    } finally {
      setLoading(false);
    }
  };

  const handleRunRelocationPriority = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await aiService.assessRelocationPriority({
        habitation_id: habitationId,
        population,
        vulnerable_population: vulnerablePop,
        hazard_severity: hazardSeverity,
        hazard_zone_intersection: hazardIntersect,
        road_accessibility: roadAccess,
        available_shelter_capacity: shelterCapacity,
        estimated_relocation_demand: relocationDemand,
        shelter: {
          total_capacity: 1000,
          current_occupancy: 600,
          verified: true,
          accessible: true,
          operational: true,
          data_freshness_hours: 2,
        },
      });
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to calculate relocation priority');
    } finally {
      setLoading(false);
    }
  };

  const handleClassifyReport = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await aiService.classifyReport({
        report_id: reportId,
        report_text: reportText,
        nearby_hazard: nearbyHazard,
      });
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to classify report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white">
      {/* Header & Model Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <h2 className="text-xl font-bold text-slate-100">AI Decision Support Engine</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
              ADVISORY ONLY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Explainable habitation risk evaluation, shelter capacity arithmetic, and keyword triage.
          </p>
        </div>

        {modelStatus && (
          <div className="text-right text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5">
            <div className="text-slate-400">Model: <span className="text-sky-400 font-mono font-medium">{modelStatus.model_version}</span></div>
            <div className="text-amber-400/90 font-medium mt-0.5">⚠️ No automatic actions taken</div>
          </div>
        )}
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 border-b border-slate-800 mb-6">
        <button
          onClick={() => { setActiveTab('risk'); setResult(null); }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'risk'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Habitation Risk Assessment
        </button>
        <button
          onClick={() => { setActiveTab('relocation'); setResult(null); }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'relocation'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Relocation Priority (P1–P4)
        </button>
        <button
          onClick={() => { setActiveTab('classify'); setResult(null); }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'classify'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Report Triage &amp; Classification
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Column */}
        <div className="space-y-4 bg-slate-950/60 p-4 rounded-lg border border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            {activeTab === 'risk' && 'Habitation Parameters'}
            {activeTab === 'relocation' && 'Relocation Demand & Shelter Capacity'}
            {activeTab === 'classify' && 'Citizen Report Input'}
          </h3>

          {activeTab !== 'classify' ? (
            <>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Habitation ID / Sector</label>
                <input
                  type="text"
                  value={habitationId}
                  onChange={(e) => setHabitationId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Total Population</label>
                  <input
                    type="number"
                    value={population}
                    onChange={(e) => setPopulation(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Vulnerable Population</label>
                  <input
                    type="number"
                    value={vulnerablePop}
                    onChange={(e) => setVulnerablePop(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Hazard Severity (0.0 – 1.0)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={hazardSeverity}
                    onChange={(e) => setHazardSeverity(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Road Accessibility (0.0 – 1.0)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={roadAccess}
                    onChange={(e) => setRoadAccess(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="hazardIntersect"
                  checked={hazardIntersect}
                  onChange={(e) => setHazardIntersect(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-sky-500"
                />
                <label htmlFor="hazardIntersect" className="text-xs text-slate-300">
                  Habitation intersects active hazard polygon
                </label>
              </div>

              {activeTab === 'relocation' && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Available Shelter Capacity</label>
                    <input
                      type="number"
                      value={shelterCapacity}
                      onChange={(e) => setShelterCapacity(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Estimated Relocation Demand</label>
                    <input
                      type="number"
                      value={relocationDemand}
                      onChange={(e) => setRelocationDemand(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-100"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={activeTab === 'risk' ? handleRunRiskAssessment : handleRunRelocationPriority}
                disabled={loading}
                className="w-full mt-3 py-2 px-4 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-sky-950/40"
              >
                {loading ? 'Evaluating Model...' : activeTab === 'risk' ? 'Run Habitation Risk Assessment' : 'Evaluate Relocation Priority'}
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Report ID</label>
                <input
                  type="text"
                  value={reportId}
                  onChange={(e) => setReportId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Report Description</label>
                <textarea
                  rows={4}
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-100"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="nearbyHazardCheck"
                  checked={nearbyHazard}
                  onChange={(e) => setNearbyHazard(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-sky-500"
                />
                <label htmlFor="nearbyHazardCheck" className="text-xs text-slate-300">
                  Location is near active reported hazard
                </label>
              </div>

              <button
                onClick={handleClassifyReport}
                disabled={loading}
                className="w-full mt-3 py-2 px-4 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-sky-950/40"
              >
                {loading ? 'Classifying Report...' : 'Classify Citizen Incident'}
              </button>
            </>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 rounded text-xs text-rose-300">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Results Column */}
        <div className="space-y-4 bg-slate-950/60 p-4 rounded-lg border border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            AI Advisory Output &amp; Explainability
          </h3>

          {!result ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-sm">
              <span className="text-3xl mb-2">📊</span>
              <span>Execute an assessment to view transparent AI advice</span>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Primary Metric Card */}
              <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Predicted Classification</span>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded ${
                    result.result.risk_level === 'CRITICAL' || result.result.relocation_priority === 'P1'
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : result.result.risk_level === 'HIGH' || result.result.relocation_priority === 'P2'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}>
                    {result.result.risk_level || result.result.relocation_priority || result.result.predicted_category}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Confidence: </span>
                    <span className="font-semibold text-slate-200">{(result.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Human Review: </span>
                    <span className={`font-semibold ${result.requires_human_review ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {result.requires_human_review ? 'REQUIRED' : 'Advisory'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Action: </span>
                    <span className="font-semibold text-slate-200">
                      {result.result.priority || result.result.recommended_action || 'EVALUATE'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Status: </span>
                    <span className="font-semibold text-slate-200">{result.verification_status}</span>
                  </div>
                </div>
              </div>

              {/* Explainability factors */}
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <div className="text-xs font-semibold text-slate-300 mb-2">Explainable Decision Factors:</div>
                <ul className="space-y-1 text-xs text-slate-400">
                  {result.explanation.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-sky-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Data quality / warnings */}
              {result.data_quality.source_warnings.length > 0 && (
                <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-lg text-xs text-amber-300">
                  <div className="font-semibold mb-1">Data Quality Warnings:</div>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {result.data_quality.source_warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
