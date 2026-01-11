
import React, { useState, useRef } from 'react';
import Header from './components/Header.tsx';
import DetectionOverlay from './components/DetectionOverlay.tsx';
import StatsPanel from './components/StatsPanel.tsx';
import { analyzeImage, resolveLocation } from './services/geminiService';
import { generatePDFReport } from './services/reportService';
import { AppState } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    image: null,
    isAnalyzing: false,
    results: null,
    location: null,
    isLocating: false,
    error: null,
  });

  const [locationQuery, setLocationQuery] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setState(prev => ({ ...prev, error: "Please upload a valid image file (JPG/PNG)." }));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setState({
          image: e.target?.result as string,
          isAnalyzing: false,
          results: null,
          location: null,
          isLocating: false,
          error: null,
        });
        setLocationQuery('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetect = async () => {
    if (!state.image) return;
    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));
    try {
      const results = await analyzeImage(state.image);
      setState(prev => ({ ...prev, results, isAnalyzing: false }));
    } catch (err: any) {
      setState(prev => ({ ...prev, isAnalyzing: false, error: err.message }));
    }
  };

  const handleDownloadReport = async () => {
    if (!state.results) return;
    setIsGeneratingReport(true);
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      // Scroll to the top of report-content to ensure it is in view for capture
      document.getElementById('report-content')?.scrollIntoView({ behavior: 'smooth' });
      
      // Delay slightly for smooth scroll and rendering
      setTimeout(async () => {
        await generatePDFReport('report-content', `ROAD-SURFACE-ANALYSIS-${timestamp}.pdf`);
        setIsGeneratingReport(false);
      }, 500);
    } catch (err: any) {
      console.error(err);
      setState(prev => ({ ...prev, error: "PDF Export failed. Check browser permissions." }));
      setIsGeneratingReport(false);
    }
  };

  const handleGetGPSLocation = () => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: "Browser does not support Geolocation." }));
      return;
    }

    setState(prev => ({ ...prev, isLocating: true, error: null }));
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState(prev => ({ 
          ...prev, 
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: position.timestamp,
            address: "Live GPS Verification"
          }, 
          isLocating: false 
        }));
      },
      (error) => {
        let msg = "Location Access Denied.";
        if (error.code === 1) msg = "Permission Denied: Please enable Location Services in your browser settings and try again.";
        if (error.code === 2) msg = "Location Unavailable: Check your network/GPS signal.";
        if (error.code === 3) msg = "Location Request Timed Out.";
        setState(prev => ({ ...prev, isLocating: false, error: msg }));
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationQuery.trim()) return;

    setState(prev => ({ ...prev, isLocating: true, error: null }));
    try {
      const location = await resolveLocation(locationQuery);
      setState(prev => ({ ...prev, location, isLocating: false }));
    } catch (err: any) {
      setState(prev => ({ ...prev, isLocating: false, error: err.message }));
    }
  };

  const reset = () => {
    setState({
      image: null,
      isAnalyzing: false,
      results: null,
      location: null,
      isLocating: false,
      error: null,
    });
    setLocationQuery('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {!state.image ? (
          <div className="flex flex-col items-center justify-center h-[70vh] border-4 border-dashed border-gray-200 rounded-[3rem] bg-white p-12 text-center transition-all hover:border-black group shadow-2xl">
            <div className="bg-yellow-400 p-8 rounded-full mb-8 shadow-xl group-hover:scale-105 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-4xl font-black text-black mb-4 uppercase tracking-tighter">Initiate Road Scan</h2>
            <p className="text-gray-500 mb-10 max-w-md text-lg">Deploy AI Vision to detect, categorize, and report infrastructure hazards with military precision.</p>
            <label className="cursor-pointer bg-black hover:bg-gray-800 text-white font-black py-5 px-12 rounded-full shadow-2xl transition-all active:scale-95 text-xl tracking-widest uppercase">
              Select Imaging Source
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            <div className="xl:col-span-8 space-y-6">
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-2xl font-black text-black uppercase tracking-tighter flex items-center">
                  <span className="w-4 h-4 bg-yellow-400 rounded-full mr-3 animate-pulse"></span>
                  Visual Intelligence Output
                </h2>
                <div className="flex space-x-4">
                  {state.results && (
                    <button 
                      onClick={handleDownloadReport} 
                      disabled={isGeneratingReport}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-black py-2 px-6 rounded-full text-xs uppercase tracking-widest shadow-lg transition-all disabled:opacity-50 flex items-center"
                    >
                      {isGeneratingReport ? (
                        <>
                          <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Encoding PDF...
                        </>
                      ) : (
                        'Export Engineering PDF'
                      )}
                    </button>
                  )}
                  <button onClick={reset} className="font-bold text-gray-400 hover:text-red-600 transition-colors uppercase text-xs tracking-widest">
                    New Scan
                  </button>
                </div>
              </div>

              {/* PDF Container - Engineered for perfect capture */}
              <div id="report-content" className="bg-white p-10 shadow-2xl border border-gray-100 min-h-screen">
                <div className="space-y-10">
                  {!state.results ? (
                    <div className="rounded-none overflow-hidden bg-black shadow-inner">
                      <img src={state.image} alt="Raw Input" className="w-full h-auto block opacity-80" />
                    </div>
                  ) : (
                    <>
                      <DetectionOverlay imageSrc={state.image} detections={state.results.potholes} />
                      <div className="mt-10">
                        <StatsPanel results={state.results} location={state.location} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="xl:col-span-4 space-y-8">
              {!state.results && (
                <div className="bg-black text-white p-8 rounded-3xl shadow-2xl">
                  <h3 className="text-xl font-black uppercase mb-4 tracking-tighter">System Ready</h3>
                  <p className="text-gray-400 text-sm mb-8 leading-relaxed">AI is standing by. Once confirmed, the road surface will be analyzed for depth, width, and structural integrity.</p>
                  <button
                    onClick={handleDetect}
                    disabled={state.isAnalyzing}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-black py-4 rounded-2xl shadow-xl transition-all active:scale-[0.98] uppercase tracking-widest"
                  >
                    {state.isAnalyzing ? 'Processing Intelligence...' : 'Authorize Full Scan'}
                  </button>
                </div>
              )}

              <section className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl space-y-6">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Geospatial Tagging</h3>
                
                <form onSubmit={handleManualSearch} className="space-y-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Manual Site Identification</p>
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      placeholder="Enter street or area..."
                      className="flex-grow px-4 py-3 border border-gray-100 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black placeholder-gray-400 font-bold"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                    />
                    <button type="submit" className="bg-black text-white px-5 rounded-xl font-black text-xs uppercase">Go</button>
                  </div>
                </form>

                <div className="relative flex items-center justify-center py-2">
                  <div className="w-full h-px bg-gray-100"></div>
                  <span className="absolute bg-white px-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">OR</span>
                </div>

                <button 
                  onClick={handleGetGPSLocation}
                  disabled={state.isLocating}
                  className="w-full flex items-center justify-center space-x-3 py-4 px-6 border-2 border-gray-100 rounded-2xl text-xs font-black text-black hover:bg-gray-50 transition-all disabled:opacity-50 uppercase tracking-widest"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span>{state.isLocating ? 'Acquiring GPS Signal...' : 'Verify Live GPS'}</span>
                </button>
              </section>

              {state.error && (
                <div className="bg-red-600 text-white p-6 rounded-2xl shadow-xl animate-bounce">
                  <div className="flex items-center space-x-3 mb-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                    <p className="font-black text-xs uppercase">System Notice</p>
                  </div>
                  <p className="text-sm font-bold leading-tight opacity-90">{state.error}</p>
                  <button onClick={() => setState(p => ({...p, error: null}))} className="mt-3 text-[10px] font-black uppercase underline decoration-2">Dismiss</button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
