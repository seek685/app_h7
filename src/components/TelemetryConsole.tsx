import React from 'react';
import { InteractiveState, ThemeAccent } from '../types';
import { Grid, Sliders, Zap, Play, Check, Eye, RefreshCw, Radio, Database } from 'lucide-react';

interface TelemetryConsoleProps {
  state: InteractiveState;
  onChangeAccent: (accent: ThemeAccent) => void;
  onToggleGrid: () => void;
  onToggleScanline: () => void;
  onChangeSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
  onTriggerSignal: (signalKey: keyof InteractiveState['simulatingSignals']) => void;
}

export const TelemetryConsole: React.FC<TelemetryConsoleProps> = ({
  state,
  onChangeAccent,
  onToggleGrid,
  onToggleScanline,
  onChangeSpeed,
  onTriggerSignal
}) => {
  const accents: { id: ThemeAccent; label: string; colorClass: string }[] = [
    { id: 'cyan', label: 'CYAN CYBER', colorClass: 'bg-cyan-500' },
    { id: 'magenta', label: 'SOLAR ORCHID', colorClass: 'bg-pink-500' },
    { id: 'yellow', label: 'LEMON ACID', colorClass: 'bg-yellow-500' },
    { id: 'red', label: 'NEON CRIMSON', colorClass: 'bg-red-500' }
  ];

  const getAccentGlow = (accent: ThemeAccent): string => {
    switch (accent) {
      case 'cyan': return 'shadow-[0_0_12px_rgba(6,182,212,0.4)] border-cyan-500';
      case 'magenta': return 'shadow-[0_0_12px_rgba(236,72,153,0.4)] border-pink-500';
      case 'yellow': return 'shadow-[0_0_12px_rgba(234,179,8,0.4)] border-yellow-500';
      case 'red': return 'shadow-[0_0_12px_rgba(244,63,94,0.4)] border-red-500';
    }
  };

  return (
    <div 
      className="w-full bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-850 p-6 space-y-6 hover:border-slate-800 transition-all shadow-xl"
      id="telemetry-console-deck"
    >
      {/* SECTION 1: SIMULATE BUS PATHWAYS */}
      <div className="space-y-3.5">
        <h4 className="text-[10px] font-mono text-slate-500 tracking-wider uppercase flex items-center gap-1">
          <Zap size={11} className="text-amber-500" />
          SIMULATION CONTROLLER (EMIT TRACE SIGNALS):
        </h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* CAMERA TRIGGER */}
          <button
            onClick={() => onTriggerSignal('camera')}
            className={`flex flex-col gap-1.5 p-3 rounded-xl border text-left cursor-pointer transition-all ${
              state.simulatingSignals.camera
                ? 'bg-pink-500/10 border-pink-500 text-pink-300 shadow-[0_0_10px_rgba(236,72,153,0.15)]'
                : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-300'
            }`}
            id="trigger-signal-camera"
            title="Pules high-framerate image pixel data over DCMI parallel lines"
          >
            <div className="flex items-center justify-between">
              <Eye size={14} className={state.simulatingSignals.camera ? "text-pink-400 animate-pulse" : "text-slate-500"} />
              <span className="text-[8px] font-mono uppercase bg-slate-900 px-1 py-0.5 rounded border border-slate-800">
                DCMI
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-sans font-bold">FLOW VIDEO DATA</span>
              <span className="text-[8px] font-mono text-slate-500 uppercase mt-0.5">OV5640 ➔ STM32H7</span>
            </div>
          </button>

          {/* LCD REFRESH */}
          <button
            onClick={() => onTriggerSignal('lcd')}
            className={`flex flex-col gap-1.5 p-3 rounded-xl border text-left cursor-pointer transition-all ${
              state.simulatingSignals.lcd
                ? 'bg-yellow-500/10 border-yellow-500 text-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.15)]'
                : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-300'
            }`}
            id="trigger-signal-lcd"
            title="Drives continuous frame updates over 24-bit RGB parallel bus lines"
          >
            <div className="flex items-center justify-between">
              <RefreshCw size={14} className={state.simulatingSignals.lcd ? "text-yellow-400 animate-spin" : "text-slate-500"} />
              <span className="text-[8px] font-mono uppercase bg-slate-900 px-1 py-0.5 rounded border border-slate-800">
                LTDC
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-sans font-bold">REFRESH DISPLAY</span>
              <span className="text-[8px] font-mono text-slate-500 uppercase mt-0.5">STM32H7 ➔ TFT-LCD</span>
            </div>
          </button>

          {/* SONAR SENSOR */}
          <button
            onClick={() => onTriggerSignal('ultrasonic')}
            className={`flex flex-col gap-1.5 p-3 rounded-xl border text-left cursor-pointer transition-all ${
              state.simulatingSignals.ultrasonic
                ? 'bg-purple-500/10 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.15)]'
                : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-300'
            }`}
            id="trigger-signal-ultrasonic"
            title="Triggers high-frequency sonic bursts and captures timed reflection pulses"
          >
            <div className="flex items-center justify-between">
              <Radio size={14} className={state.simulatingSignals.ultrasonic ? "text-purple-400 animate-ping" : "text-slate-500"} />
              <span className="text-[8px] font-mono uppercase bg-slate-900 px-1 py-0.5 rounded border border-slate-800">
                TIM1_EXTI
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-sans font-bold">EMIT SONIC PING</span>
              <span className="text-[8px] font-mono text-slate-500 uppercase mt-0.5">SONIC ➔ STM32H7</span>
            </div>
          </button>

          {/* WIFI INTERACTIVE CLOUD */}
          <button
            onClick={() => onTriggerSignal('wifi')}
            className={`flex flex-col gap-1.5 p-3 rounded-xl border text-left cursor-pointer transition-all ${
              state.simulatingSignals.wifi
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-300'
            }`}
            id="trigger-signal-wifi"
            title="Channels wireless telemetry packages over 4-bit multiplexed SDIO bus routing"
          >
            <div className="flex items-center justify-between">
              <Database size={14} className={state.simulatingSignals.wifi ? "text-emerald-400 animate-bounce" : "text-slate-500"} />
              <span className="text-[8px] font-mono uppercase bg-slate-900 px-1 py-0.5 rounded border border-slate-800">
                SDIO-MQTT
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-sans font-bold">SYNC CLOUD DATA</span>
              <span className="text-[8px] font-mono text-slate-500 uppercase mt-0.5">WIFI ➔ EDGE CLOUD</span>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* SECTION 2: CAD THEMING & NEON ACCENTS */}
        <div className="space-y-3.5">
          <h4 className="text-[10px] font-mono text-slate-500 tracking-wider uppercase flex items-center gap-1">
            <Sliders size={11} className="text-slate-400" />
            CHOOSE THEME NEON ACCENT:
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {accents.map((acc) => (
              <button
                key={acc.id}
                onClick={() => onChangeAccent(acc.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono cursor-pointer transition-all ${
                  state.accentColor === acc.id
                    ? `bg-slate-900 ${getAccentGlow(acc.id)} text-white`
                    : 'bg-slate-950/40 border-slate-850/60 text-slate-400 hover:border-slate-800 hover:bg-slate-900/30'
                }`}
                id={`btn-accent-${acc.id}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${acc.colorClass}`} />
                  <span className="text-[10px] font-bold tracking-wider">{acc.label}</span>
                </div>
                {state.accentColor === acc.id && (
                  <Check size={11} className="text-emerald-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 3: SYSTEM VIEW overlays */}
        <div className="space-y-3.5">
          <h4 className="text-[10px] font-mono text-slate-500 tracking-wider uppercase flex items-center gap-1">
            <Grid size={11} className="text-slate-400" />
            VIRTUAL OSCILLOSCOPE FILTERS:
          </h4>
          <div className="grid grid-cols-2 gap-3.5 bg-slate-950/45 border border-slate-850 p-2.5 rounded-2xl">
            {/* Toggle grid */}
            <div className="flex items-center justify-between px-1">
              <div className="flex flex-col">
                <span className="text-[11px] font-sans font-bold text-slate-300">BLUEPRINT GRID</span>
                <span className="text-[8px] font-mono text-slate-600 uppercase">COORD CHANNELS</span>
              </div>
              <button
                onClick={onToggleGrid}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  state.isGridVisible ? 'bg-slate-700' : 'bg-slate-900'
                }`}
                id="toggle-scope-grid"
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    state.isGridVisible ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle scanlines */}
            <div className="flex items-center justify-between px-1">
              <div className="flex flex-col">
                <span className="text-[11px] font-sans font-bold text-slate-300">SCANLINE FILTER</span>
                <span className="text-[8px] font-mono text-slate-600 uppercase">CRT MODULATION</span>
              </div>
              <button
                onClick={onToggleScanline}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  state.isScanlineVisible ? 'bg-slate-700' : 'bg-slate-900'
                }`}
                id="toggle-vscope-scanlines"
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    state.isScanlineVisible ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: SPEED CONTROLLER */}
      <div className="border-t border-slate-850 pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col text-left gap-0.5">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
            BUS BAUD RATIO MODULATOR:
          </span>
          <span className="text-[11px] font-sans text-slate-400">
            Calibrate parallel copper-tracer stream animations.
          </span>
        </div>
        <div className="flex gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-850">
          {(['slow', 'normal', 'fast'] as const).map((spd) => (
            <button
              key={spd}
              onClick={() => onChangeSpeed(spd)}
              className={`px-3 py-1 text-[10px] font-mono rounded-lg cursor-pointer transition-all uppercase ${
                state.traceSpeed === spd
                  ? 'bg-slate-850 text-white font-bold border border-slate-750'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              id={`btn-baud-speed-${spd}`}
            >
              {spd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
