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
    { id: 'cyan', label: '霓虹青 (CYAN)', colorClass: 'bg-cyan-500' },
    { id: 'magenta', label: '荧光粉 (MAGENTA)', colorClass: 'bg-pink-500' },
    { id: 'yellow', label: '钛金黄 (YELLOW)', colorClass: 'bg-yellow-500' },
    { id: 'red', label: '烈焰红 (RED)', colorClass: 'bg-red-500' }
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
      {/* 模块 1: 总线铜线通路信号仿真 */}
      <div className="space-y-3.5">
        <h4 className="text-[10px] font-mono text-slate-500 tracking-wider uppercase flex items-center gap-1">
          <Zap size={11} className="text-amber-500" />
          全通信总线链路注入器 (点击发射同步信号)
        </h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* 摄像头总线信号发射 */}
          <button
            onClick={() => onTriggerSignal('camera')}
            className={`flex flex-col gap-1.5 p-3 rounded-xl border text-left cursor-pointer transition-all ${
              state.simulatingSignals.camera
                ? 'bg-pink-500/10 border-pink-500 text-pink-300 shadow-[0_0_10px_rgba(236,72,153,0.15)]'
                : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-300'
            }`}
            id="trigger-signal-camera"
            title="通过 8 位 DCMI 并行摄像总线发起实时视频裸数据传输仿真"
          >
            <div className="flex items-center justify-between">
              <Eye size={14} className={state.simulatingSignals.camera ? "text-pink-400 animate-pulse" : "text-slate-500"} />
              <span className="text-[8px] font-mono uppercase bg-slate-900 px-1 py-0.5 rounded border border-slate-800 text-slate-300">
                8位 DCMI 并口
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-sans font-bold">流式图像并行通信</span>
              <span className="text-[8px] font-mono text-slate-500 uppercase mt-0.5">OV5640 ➔ STM32H7</span>
            </div>
          </button>

          {/* LCD 控制器信号刷新 */}
          <button
            onClick={() => onTriggerSignal('lcd')}
            className={`flex flex-col gap-1.5 p-3 rounded-xl border text-left cursor-pointer transition-all ${
              state.simulatingSignals.lcd
                ? 'bg-yellow-500/10 border-yellow-500 text-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.15)]'
                : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-300'
            }`}
            id="trigger-signal-lcd"
            title="通过 24 位并行 RGB 液晶总线驱动实时帧缓冲区更新"
          >
            <div className="flex items-center justify-between">
              <RefreshCw size={14} className={state.simulatingSignals.lcd ? "text-yellow-400 animate-spin" : "text-slate-500"} />
              <span className="text-[8px] font-mono uppercase bg-slate-900 px-1 py-0.5 rounded border border-slate-800 text-slate-300">
                LTDC 像素
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-sans font-bold">显示屏扫描刷新</span>
              <span className="text-[8px] font-mono text-slate-500 uppercase mt-0.5">STM32H7 ➔ TFT-LCD</span>
            </div>
          </button>

          {/* 超声波避障传感器信号捕获 */}
          <button
            onClick={() => onTriggerSignal('ultrasonic')}
            className={`flex flex-col gap-1.5 p-3 rounded-xl border text-left cursor-pointer transition-all ${
              state.simulatingSignals.ultrasonic
                ? 'bg-purple-500/10 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.15)]'
                : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-300'
            }`}
            id="trigger-signal-ultrasonic"
            title="发送 40 kHz 音频脉冲，触动输入捕获中断引脚对时间计时换算"
          >
            <div className="flex items-center justify-between">
              <Radio size={14} className={state.simulatingSignals.ultrasonic ? "text-purple-400 animate-ping" : "text-slate-500"} />
              <span className="text-[8px] font-mono uppercase bg-slate-900 px-1 py-0.5 rounded border border-slate-800 text-slate-300">
                TIM1 捕获器
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-sans font-bold">声呐脉冲触发测距</span>
              <span className="text-[8px] font-mono text-slate-500 uppercase mt-0.5">探头 ➔ STM32H7</span>
            </div>
          </button>

          {/* WiFi IoT 遥测云端队列交互 */}
          <button
            onClick={() => onTriggerSignal('wifi')}
            className={`flex flex-col gap-1.5 p-3 rounded-xl border text-left cursor-pointer transition-all ${
              state.simulatingSignals.wifi
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-300'
            }`}
            id="trigger-signal-wifi"
            title="通过硬件 SDIO 传输通道，与无线空口及远程 MQTT 服务器握手同步物联网指标"
          >
            <div className="flex items-center justify-between">
              <Database size={14} className={state.simulatingSignals.wifi ? "text-emerald-400 animate-bounce" : "text-slate-500"} />
              <span className="text-[8px] font-mono uppercase bg-slate-900 px-1 py-0.5 rounded border border-slate-800 text-slate-300">
                SDIO + MQTT
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-sans font-bold">云端网络遥测同步</span>
              <span className="text-[8px] font-mono text-slate-500 uppercase mt-0.5">WiFi ➔ 物联网云</span>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* 模块 2: CAD 海报及系统配色切换 */}
        <div className="space-y-3.5">
          <h4 className="text-[10px] font-mono text-slate-500 tracking-wider uppercase flex items-center gap-1">
            <Sliders size={11} className="text-slate-400" />
            快速调整海报视觉主题配色:
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

        {/* 模块 3: 系统虚拟网格 / 扫描线示波器背景滤镜 */}
        <div className="space-y-3.5">
          <h4 className="text-[10px] font-mono text-slate-500 tracking-wider uppercase flex items-center gap-1">
            <Grid size={11} className="text-slate-400" />
            虚拟示波器背景滤镜调节:
          </h4>
          <div className="grid grid-cols-2 gap-3.5 bg-slate-950/45 border border-slate-850 p-2.5 rounded-2xl">
            {/* 蓝图网格切换 */}
            <div className="flex items-center justify-between px-1">
              <div className="flex flex-col">
                <span className="text-[11px] font-sans font-bold text-slate-300">空间参考网格</span>
                <span className="text-[8px] font-mono text-slate-600 uppercase">网格坐标对齐</span>
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

            {/* 机壳扫描线 CRT 变频滤镜 */}
            <div className="flex items-center justify-between px-1">
              <div className="flex flex-col">
                <span className="text-[11px] font-sans font-bold text-slate-300">赛博扫描线滤镜</span>
                <span className="text-[8px] font-mono text-slate-600 uppercase">复古 CRT 渲染</span>
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

      {/* 模块 4: 总线波特率仿真控制档位 */}
      <div className="border-t border-slate-850 pt-4 flex flex-col md:flex-row items-center justify-between gap-4 font-mono">
        <div className="flex flex-col text-left gap-0.5">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
            系统总线仿真帧率调节档:
          </span>
          <span className="text-[11px] font-sans text-slate-400">
            调校三维电路图上并行各传感器高速铜线传输数据包的流速。
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
              {spd === 'slow' ? '慢速 (SLOW)' : spd === 'normal' ? '常规 (NORMAL)' : '高速 (FAST)'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
