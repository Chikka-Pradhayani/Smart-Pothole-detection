
import React from 'react';
import { DetectionResult, Severity, LocationData } from '../types';

interface Props {
  results: DetectionResult;
  location: LocationData | null;
}

const StatsPanel: React.FC<Props> = ({ results, location }) => {
  const counts = results.potholes.reduce((acc, curr) => {
    acc[curr.severity] = (acc[curr.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const reportDate = new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  return (
    <div className="space-y-8 bg-white">
      {/* Official PDF Header */}
      <div className="flex justify-between items-end border-b-4 border-black pb-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-black">Technical Road Inspection</h1>
          <p className="text-sm font-mono text-gray-500">REF: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-black uppercase tracking-widest bg-yellow-400 px-2 py-1">Automated AI Assessment</p>
        </div>
      </div>

      {/* Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">AI Condition Assessment</h3>
          <p className="text-lg font-bold text-gray-800 leading-snug">
            "{results.summary}"
          </p>
        </div>
        <div className="space-y-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">Inspection Timestamp</h3>
          <p className="text-sm font-bold text-gray-900">{reportDate}</p>
        </div>
      </div>

      {/* Geospatial Summary */}
      <div className="bg-gray-50 border border-gray-200 p-6 rounded-none">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Site Location Data</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Target Address / Reference</p>
            <p className="text-sm font-black text-black">{location?.address || 'Geolocation Not Provided'}</p>
          </div>
          <div className="font-mono text-xs flex space-x-6">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Latitude</p>
              <p className="text-black font-bold">{location?.latitude?.toFixed(6) || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Longitude</p>
              <p className="text-black font-bold">{location?.longitude?.toFixed(6) || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Summary Stats */}
      <div className="grid grid-cols-3 gap-0 border border-black">
        <div className="p-4 border-r border-black bg-red-600 text-white text-center">
          <p className="text-[10px] font-black uppercase">Critical</p>
          <p className="text-4xl font-black">{counts[Severity.HIGH] || 0}</p>
        </div>
        <div className="p-4 border-r border-black bg-yellow-400 text-black text-center">
          <p className="text-[10px] font-black uppercase">Moderate</p>
          <p className="text-4xl font-black">{counts[Severity.MEDIUM] || 0}</p>
        </div>
        <div className="p-4 bg-green-500 text-white text-center">
          <p className="text-[10px] font-black uppercase">Minor</p>
          <p className="text-4xl font-black">{counts[Severity.LOW] || 0}</p>
        </div>
      </div>

      {/* Detailed Technical Inventory */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">Detailed Hazard Inventory</h3>
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
              <th className="py-3 text-left">Ref ID</th>
              <th className="py-3 text-left">Confidence</th>
              <th className="py-3 text-left">Severity Level</th>
              <th className="py-3 text-left">Recommended Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {results.potholes.map((p, idx) => (
              <tr key={idx} className="text-sm">
                <td className="py-4 font-mono font-bold text-gray-900">P-{idx + 1}</td>
                <td className="py-4 font-bold text-blue-600">{Math.round(p.confidence * 100)}% Match</td>
                <td className="py-4">
                  <span className={`text-[10px] font-black uppercase px-2 py-1 ${
                    p.severity === Severity.HIGH ? 'text-red-600 bg-red-50' : 
                    p.severity === Severity.MEDIUM ? 'text-yellow-600 bg-yellow-50' : 
                    'text-green-600 bg-green-50'
                  }`}>
                    {p.severity} Priority
                  </span>
                </td>
                <td className="py-4 text-xs font-medium text-gray-600">
                  {p.severity === Severity.HIGH ? 'Immediate Patching & Cordoning Required' : 
                   p.severity === Severity.MEDIUM ? 'Schedule Repair within 7-14 Business Days' : 
                   'Monitor for Growth - Routine Maintenance Item'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Disclaimer */}
      <div className="pt-8 border-t border-gray-200">
        <p className="text-[9px] text-gray-400 uppercase text-center leading-tight">
          This report was generated automatically by an AI Vision System. Data is intended for preliminary road surface evaluation only. Final engineering decisions should be verified on-site by certified inspectors.
        </p>
      </div>
    </div>
  );
};

export default StatsPanel;
