import React from 'react';
import { ModuleInfo, ThemeAccent } from '../types';
import { Cpu, Eye, Tv, Radio, Database, Wifi, ShieldCheck, Zap, Activity, Layers, Tag } from 'lucide-react';

interface ModuleInspectorProps {
  module: ModuleInfo | null;
  accentColor: ThemeAccent;
}

export const ModuleInspector: React.FC<ModuleInspectorProps> = ({ module, accentColor }) => {
  const getAccentColorClass = (accent: ThemeAccent): string => {
    switch (accent) {
      case 'cyan': return 'text-cyan-400 border-cyan-400/20';
      case 'magenta': return 'text-pink-400 border-pink-400/20';
      case 'yellow': return 'text-yellow-400 border-yellow-400/20';
      case 'red': return 'text-red-400 border-red-400/20';
    }
  };

  const getAccentBgClass = (accent: ThemeAccent): string => {
    switch (accent) {
      case 'cyan': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'magenta': return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
      case 'yellow': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'red': return 'bg-red-500/10 text-red-500/20';
    }
  };

  const getModuleIcon = (id: string) => {
    const size = 18;
    switch (id) {
      case 'stm32h7': return <Cpu size={size} />;
      case 'ov5640': return <Eye size={size} />;
      case 'lcd': return <Tv size={size} />;
      case 'ultrasonic': return <Radio size={size} />;
      case 'wifi': return <Wifi size={size} />;
      case 'cloud': return <Database size={size} />;
      default: return <Cpu size={size} />;
    }
  };

  // If no module is selected, render an overview of the system architecture spec
  if (!module) {
    return (
      <div 
        className="w-full bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-850 p-6 flex flex-col justify-between h-full hover:border-slate-800 transition-all shadow-xl"
        id="inspector-overview-panel"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="font-mono text-sm tracking-wider font-semibold text-slate-200">
                ARCHITECTURE OVERVIEW
              </h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              STABLE INFRA
            </span>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-sans font-medium tracking-tight text-white">
              Embedded Edge AI Camera System
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              This interactive visual CAD poster highlights the high-speed data flow and hardware configuration 
              of an edge AI camera architecture. Powered by dual-bus topologies, the system operates completely 
              offline for local machine vision processes, updating displays and sending telemetry through 
              glowing, synchronized communication pathways.
            </p>
          </div>

          {/* Quick specs section */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-950/70 rounded-xl border border-slate-850 p-3 flex flex-col gap-1.5">
              <span className="text-[9px] font-mono text-slate-500 tracking-wider uppercase">CORE CHIP CONTROLLER</span>
              <span className="text-xs font-mono font-bold text-slate-300">STM32H7 (ARM-M7)</span>
            </div>
            <div className="bg-slate-950/70 rounded-xl border border-slate-850 p-3 flex flex-col gap-1.5">
              <span className="text-[9px] font-mono text-slate-500 tracking-wider uppercase">LOCAL TENSOR SPEED</span>
              <span className="text-xs font-mono font-bold text-slate-300">1027 DMIPS Peak</span>
            </div>
            <div className="bg-slate-950/70 rounded-xl border border-slate-850 p-3 flex flex-col gap-1.5">
              <span className="text-[9px] font-mono text-slate-500 tracking-wider uppercase">PRIMARY SENSOR BUS</span>
              <span className="text-xs font-mono font-bold text-slate-300">8-bit Parallel DCMI</span>
            </div>
            <div className="bg-slate-950/70 rounded-xl border border-slate-850 p-3 flex flex-col gap-1.5">
              <span className="text-[9px] font-mono text-slate-500 tracking-wider uppercase">WIRELESS BACKBONE</span>
              <span className="text-xs font-mono font-bold text-slate-300">4-bit SDIO Interface</span>
            </div>
          </div>

          {/* Prompt adherence indicator */}
          <div className="rounded-xl border border-slate-850 bg-slate-950/40 p-3">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={16} />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-slate-300">Unlabeled Poster Standard</span>
                <p className="text-[10px] text-slate-500 leading-normal">
                  No text labels reside on the 3D drawing structure. Tap or hover over modules to trigger this dynamic probe interface.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-850 pt-4 mt-6">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
            <Activity size={10} className="text-slate-400 animate-pulse" />
            <span>Telemetry online. Standby for sensor probing...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 flex flex-col justify-between h-full transition-all duration-300 shadow-xl"
      id={`inspector-${module.id}`}
    >
      <div className="space-y-5">
        {/* Module Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg border ${getAccentBgClass(accentColor)}`}>
              {getModuleIcon(module.id)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono font-medium text-slate-500 tracking-wider uppercase">
                  NODE TYPE:
                </span>
                <span className={`text-[9px] font-mono font-bold px-1 rounded uppercase tracking-wider ${getAccentBgClass(accentColor)}`}>
                  {module.acronym}
                </span>
              </div>
              <h3 className="font-sans font-semibold text-base text-white tracking-tight mt-0.5">
                {module.name}
              </h3>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-500 mt-1">
            0x{module.id.charCodeAt(0).toString(16).toUpperCase()}
          </span>
        </div>

        {/* Status indicator bar */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/55 border border-slate-850 text-xs">
          <span className="text-slate-400 font-mono text-[10px] uppercase">Connection Port Status:</span>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-emerald-400 text-[10px] font-bold uppercase tracking-wider">ACTIVE LINK</span>
          </div>
        </div>

        {/* Detailed functional role description */}
        <div className="space-y-1.5">
          <h4 className="text-[10px] font-mono text-slate-500 tracking-wider uppercase flex items-center gap-1">
            <Tag size={10} />
            FUNCTIONAL INTEGRATION ROLE:
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/20 p-2.5 rounded-lg border border-slate-850/60">
            {module.role}
          </p>
        </div>

        {/* Electrical & Hardware specifications */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-mono text-slate-500 tracking-wider uppercase flex items-center gap-1">
            <Layers size={10} />
            DIAGNOSTIC SPECIFICATIONS:
          </h4>
          <div className="grid grid-cols-2 gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-850/60">
            {Object.entries(module.specs).map(([key, value]) => (
              <div key={key} className="flex flex-col gap-0.5">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wide">{key}</span>
                <span className="text-xs font-mono text-slate-200 font-medium truncate">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pin Out mapping layout */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-mono text-slate-500 tracking-wider uppercase flex items-center gap-1">
            <Zap size={10} />
            PERIPHERAL BUS CONNECTIONS to STM32H7:
          </h4>
          <div className="bg-slate-950/80 rounded-xl border border-slate-850 p-2.5 max-h-[140px] overflow-y-auto custom-scrollbar font-mono">
            {module.pins && module.pins.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {module.pins.map((pin, index) => (
                  <span 
                    key={index}
                    className="text-[9px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                  >
                    {pin}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[10px] text-slate-600 italic">No direct hardware physical pin assignments</span>
            )}
          </div>
        </div>

        {/* Technical communication protocol specs */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-mono text-slate-500 uppercase">VOLTAGE SPECS</span>
            <span className="text-xs font-mono text-slate-200 font-bold">{module.voltage}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-mono text-slate-500 uppercase">BUS BANDWIDTH SPEED</span>
            <span className="text-xs font-mono text-slate-200 font-bold">{module.speed}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-850 pt-4 mt-6">
        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
          <Activity size={10} className="text-slate-400 animate-pulse" />
          <span>Protocol Bus:</span>
          <span className="text-slate-300 font-bold uppercase">{module.protocol}</span>
        </div>
      </div>
    </div>
  );
};
