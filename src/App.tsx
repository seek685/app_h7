import React, { useState } from 'react';
import { InteractiveState, ModuleInfo, ThemeAccent } from './types';
import { MODULES_DATA } from './data';
import { IsometricDiagram } from './components/IsometricDiagram';
import { ModuleInspector } from './components/ModuleInspector';
import { TelemetryConsole } from './components/TelemetryConsole';
import { 
  Terminal, 
  Cpu, 
  Info, 
  HelpCircle, 
  Download, 
  Zap, 
  Layers, 
  Activity,
  FileCheck2,
  Bookmark
} from 'lucide-react';

export default function App() {
  // Main app state
  const [state, setState] = useState<InteractiveState>({
    activeModuleId: null, // hovered or selected module ID
    accentColor: 'cyan',
    isGridVisible: true,
    isScanlineVisible: true,
    glowIntensity: 3,
    traceSpeed: 'normal',
    simulatingSignals: {
      camera: false,
      lcd: false,
      ultrasonic: false,
      wifi: false,
      cloud: false
    }
  });

  // Local state for synthetic Edge AI terminal log streams
  const [aiInferenceRunning, setAiInferenceRunning] = useState<boolean>(true);
  const [inferenceLogs, setInferenceLogs] = useState<string[]>([
    '[INIT] STM32Cube.AI core loaded successfully.',
    '[SYSTEM] Frame buffer 0 & 1 allocated at SRAM bank 1 (0x30000000).',
    '[NETWORK] Listening on EXTI Line 0 (Ultrasonic Sensor timer gate).',
    '[STANDBY] OV5640 ready. Frame capture standard: RGB565 WVGA format.',
    '[INF] Running quantized YOLO-Nano CNN on-chip weight tensors...'
  ]);

  const handleHoverModule = (moduleId: string | null) => {
    setState(prev => ({
      ...prev,
      activeModuleId: moduleId ? moduleId : prev.activeModuleId
    }));
  };

  const handleSelectModule = (moduleId: string) => {
    setState(prev => ({
      ...prev,
      activeModuleId: moduleId ? (prev.activeModuleId === moduleId ? null : moduleId) : null
    }));
  };

  const handleChangeAccent = (accent: ThemeAccent) => {
    setState(prev => ({ ...prev, accentColor: accent }));
  };

  const handleToggleGrid = () => {
    setState(prev => ({ ...prev, isGridVisible: !prev.isGridVisible }));
  };

  const handleToggleScanline = () => {
    setState(prev => ({ ...prev, isScanlineVisible: !prev.isScanlineVisible }));
  };

  const handleChangeSpeed = (speed: 'slow' | 'normal' | 'fast') => {
    setState(prev => ({ ...prev, traceSpeed: speed }));
  };

  // Triggers trace bus animation flow and updates telemetry logs synthetically
  const handleTriggerSignal = (signalKey: keyof InteractiveState['simulatingSignals']) => {
    // 1. Flip active trace stream state
    setState(prev => ({
      ...prev,
      simulatingSignals: {
        ...prev.simulatingSignals,
        [signalKey]: true
      }
    }));

    // 2. Synthesize clean engineering logs
    const timestamp = new Date().toISOString().slice(11, 19);
    let logMsg = '';
    switch (signalKey) {
      case 'camera':
        logMsg = `[DCMI] [${timestamp}] Camera frame interrupt received index #244. Copying 384KB to MCU frame RAM.`;
        break;
      case 'lcd':
        logMsg = `[LTDC] [${timestamp}] Chrom-ART DMA2D transfer complete. Double buffer swapped. Swapped to RAM bank 2.`;
        break;
      case 'ultrasonic':
        logMsg = `[TIMER] [${timestamp}] Input capture edge detected. Sound run duration: 1140us. Sensed distance: 19.53 cm.`;
        break;
      case 'wifi':
        logMsg = `[SDIO] [${timestamp}] MQTT payload packed: { "dist": 19.53, "objects": ["person"] }. Commencing ESP32 SDIO burst.`;
        break;
    }

    setInferenceLogs(prev => [logMsg, ...prev.slice(0, 10)]);

    // 3. Clear trace stream animation after timeout
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        simulatingSignals: {
          ...prev.simulatingSignals,
          [signalKey]: false
        }
      }));

      // If it's wifi, auto trigger cloud sync for complete data flow path
      if (signalKey === 'wifi') {
        setState(prev => ({ ...prev, simulatingSignals: { ...prev.simulatingSignals, cloud: true } }));
        setInferenceLogs(prev => [
          `[CLOUD] [${timestamp}] Ingress Broker ACK received (200 OK). Deciphered AES-256 telemetry envelope.`,
          ...prev.slice(0, 10)
        ]);
        setTimeout(() => {
          setState(prev => ({ ...prev, simulatingSignals: { ...prev.simulatingSignals, cloud: false } }));
        }, 3000);
      }
    }, 3000);
  };

  // Run or Pause live model inference loop
  const toggleAiInference = () => {
    setAiInferenceRunning(prev => !prev);
    const logTag = aiInferenceRunning ? '[STOP]' : '[RUN]';
    setInferenceLogs(prev => [
      `${logTag} On-chip visual neural network classifier has been ${aiInferenceRunning ? 'PAUSED' : 'RESUMED'}.`,
      ...prev.slice(0, 10)
    ]);
  };

  // Look up selected module
  const currentModule = MODULES_DATA.find(m => m.id === state.activeModuleId) || null;

  // Render glowing border/headings based on theme accent
  const getThemeAccentClass = (accent: ThemeAccent): string => {
    switch (accent) {
      case 'cyan': return 'text-cyan-400 border-cyan-500/30';
      case 'magenta': return 'text-pink-400 border-pink-500/30';
      case 'yellow': return 'text-yellow-400 border-yellow-500/30';
      case 'red': return 'text-red-400 border-red-500/30';
    }
  };

  const getThemeBorderClass = (accent: ThemeAccent): string => {
    switch (accent) {
      case 'cyan': return 'border-cyan-500/20';
      case 'magenta': return 'border-pink-500/20';
      case 'yellow': return 'border-yellow-500/20';
      case 'red': return 'border-red-500/20';
    }
  };

  const getThemeTextClass = (accent: ThemeAccent): string => {
    switch (accent) {
      case 'cyan': return 'text-cyan-400';
      case 'magenta': return 'text-pink-400';
      case 'yellow': return 'text-yellow-400';
      case 'red': return 'text-red-400';
    }
  };

  const getThemeGlowBg = (accent: ThemeAccent): string => {
    switch (accent) {
      case 'cyan': return 'from-cyan-500/10 to-transparent';
      case 'magenta': return 'from-pink-500/10 to-transparent';
      case 'yellow': return 'from-yellow-500/10 to-transparent';
      case 'red': return 'from-red-500/10 to-transparent';
    }
  };

  const handlePrintMockup = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      
      {/* Top Professional Header Row */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-slate-900 border ${getThemeBorderClass(state.accentColor)} text-slate-200`}>
              <Cpu className={`h-6 w-6 ${getThemeTextClass(state.accentColor)} animate-pulse`} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-mono font-bold text-slate-400 tracking-widest uppercase">
                  STM32H7 Embedded AI Architecture
                </span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white font-sans uppercase">
                EMBEDDED CAMERA SYSTEM DIAGRAM
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3.5 self-stretch sm:self-auto justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-900">
            <div className="text-right hidden md:flex flex-col font-mono text-[10px] text-slate-500">
              <span>SYSTEM CAD MODULE: REV 3.4</span>
              <span>COMPILATION SCORE: 100% SUCCESS</span>
            </div>
            
            <button 
              onClick={handlePrintMockup}
              className={`flex items-center gap-1.5 px-3 py-1.8 rounded-lg bg-slate-900 border ${getThemeBorderClass(state.accentColor)} text-xs ${getThemeTextClass(state.accentColor)} hover:bg-slate-800 transition-all font-mono`}
              id="btn-print"
              title="Print layout as an engineering competition poster"
            >
              <Download size={14} />
              EXPORT POSTER
            </button>
          </div>
        </div>
      </header>

      {/* Main Container / Content Bento Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Main Workspace Frame */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main CAD Interactive Canvas stage - Col span 7 */}
          <section className="lg:col-span-8 flex flex-col gap-4">
            
            {/* Header detail */}
            <div className={`flex items-center justify-between bg-gradient-to-r ${getThemeGlowBg(state.accentColor)} border-l-2 ${getThemeBorderClass(state.accentColor).replace('border-', 'border-l-')} pl-3 py-1`}>
              <div className="flex flex-col">
                <h2 className="text-sm font-semibold tracking-wider text-white font-mono uppercase">
                  3D ISOMETRIC ENGINEERING POSTER
                </h2>
                <span className="text-[10px] font-mono text-slate-500">
                  Tap to probe physical modules. Click "Reset Camera" to center layout frame.
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <Bookmark size={12} className="text-slate-500" />
                <span>No Labels Mode</span>
              </div>
            </div>

            {/* Stage */}
            <IsometricDiagram
              state={state}
              onHoverModule={handleHoverModule}
              onSelectModule={handleSelectModule}
              activeModuleId={state.activeModuleId}
            />

            {/* Poster Legend and schematic notes */}
            <div className="bg-slate-900/30 rounded-xl border border-slate-900 p-4 font-mono text-[11px] text-slate-400 space-y-3">
              <div className="flex items-start gap-2">
                <Info size={14} className="text-primary shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Poster Engineering Design Note:</strong> This diagram renders an advanced 3D isometric representation of an AI camera hardware stack. To preserve the aesthetic format required for the competition poster, <strong>all system text labels on the actual canvas have been omitted</strong>. Components are decipherable via high-fidelity geometric modeling.
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-500 shadow-[0_0_6px_rgba(236,72,153,0.6)]" />
                  <span>DCMI Video Bus</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.6)]" />
                  <span>LTDC LCD Lines</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.6)]" />
                  <span>EXTI Distance Capture</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                  <span>4-bit SDIO WiFi Bus</span>
                </div>
              </div>
            </div>

          </section>

          {/* Sidebar module inspection console - Col span 5 */}
          <section className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Inspector */}
            <div className="h-full">
              <ModuleInspector 
                module={currentModule} 
                accentColor={state.accentColor} 
              />
            </div>

            {/* Local Artificial Intelligence Code Logs Console - TinyML Live HUD */}
            <div className="bg-slate-950 rounded-2xl border border-slate-900 p-4 space-y-3 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                <div className="flex items-center gap-1.5">
                  <Terminal size={14} className="text-slate-400 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold tracking-wider text-slate-300">
                    ON-CHIP TINYML CNN LOGS
                  </span>
                </div>
                <button
                  onClick={toggleAiInference}
                  className={`px-2.5 py-0.5 rounded text-[9px] font-mono border cursor-pointer transition-all ${
                    aiInferenceRunning 
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20' 
                      : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                  }`}
                  id="btn-toggle-inference"
                  title="Pause or resume dynamic synthetic AI models running on the microcontroller"
                >
                  {aiInferenceRunning ? 'RUNNING' : 'PAUSED'}
                </button>
              </div>

              <div className="bg-black/80 rounded-xl border border-slate-900 p-2.5 h-[135px] overflow-y-auto font-mono text-[9px] text-slate-400 space-y-1.5 custom-scrollbar relative">
                {inferenceLogs.map((log, index) => {
                  let color = 'text-slate-400';
                  if (log.includes('[DCMI]')) color = 'text-pink-400';
                  else if (log.includes('[LTDC]')) color = 'text-yellow-400';
                  else if (log.includes('[TIMER]')) color = 'text-purple-400';
                  else if (log.includes('[CLOUD]')) color = 'text-orange-400';
                  else if (log.includes('[SDIO]')) color = 'text-emerald-400';
                  else if (log.includes('[INIT]') || log.includes('[RUN]')) color = 'text-cyan-400';
                  else if (log.includes('[STOP]')) color = 'text-red-400';

                  return (
                    <div 
                      key={index} 
                      className={`leading-normal border-b border-slate-950 pb-0.5 ${color} ${
                        index === 0 && aiInferenceRunning ? 'animate-pulse' : ''
                      }`}
                    >
                      {log}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 px-1">
                <span>MODEL WEIGHTS: INT8 QUANTIZED</span>
                <span>BIAS CALIBRATION: AUTO</span>
              </div>
            </div>

          </section>

        </div>

        {/* Telemetry settings console and dynamic control deck */}
        <TelemetryConsole
          state={state}
          onChangeAccent={handleChangeAccent}
          onToggleGrid={handleToggleGrid}
          onToggleScanline={handleToggleScanline}
          onChangeSpeed={handleChangeSpeed}
          onTriggerSignal={handleTriggerSignal}
        />

      </main>

      {/* Corporate/Competition footer standard */}
      <footer className="border-t border-slate-900 bg-slate-950 py-5 mt-auto text-center">
        <div className="max-w-7xl mx-auto px-4 font-mono text-[10px] text-slate-500 space-y-1">
          <p className="uppercase tracking-wider">
            PREPARED SPECIFICALLY FOR THE 2026 EMBEDDED EDGE AI SYSTEM ENGINEERING CONTEST
          </p>
          <p className="opacity-75">
            ALL VECTOR GRAPHICS ARE MATHEMATICALLY PROJECTED IN STATIC CSS/SVG MATRIX. NO THIRD-PARTY WEBGL ASSETS REQUIRED.
          </p>
        </div>
      </footer>
    </div>
  );
}
