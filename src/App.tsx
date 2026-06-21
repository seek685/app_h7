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
  Download, 
  Zap, 
  Bookmark
} from 'lucide-react';

export default function App() {
  // 核心交互状态
  const [state, setState] = useState<InteractiveState>({
    activeModuleId: null, // 悬停或选中的硬件模块 ID
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
      cloud: false,
      voice: false
    }
  });

  // 片上仿真的 TinyML 边缘神经网络实时推理日志
  const [aiInferenceRunning, setAiInferenceRunning] = useState<boolean>(true);
  const [inferenceLogs, setInferenceLogs] = useState<string[]>([
    '[初始化 INIT] STM32Cube.AI 边缘神经网络推理核心成功加载。',
    '[系统运行 SYSTEM] 帧双缓冲区 #0 与 #1 开辟于高速本地静态 SRAM1 区间 (0x30000000)。',
    '[总线侦听 NETWORK] 正在侦听外部中断线 EXTI Line 0 (超声测距定时器开窗门限)。',
    '[就绪就绪 STANDBY] OV5640 镜组校准对焦完成。图像捕获格式: WVGA RGB565，30FPS。',
    '[推理运行 INF] 正在片上算力核心中加载 YOLO-Nano 神经网络权值进行图像识别推理...'
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

  // 在总线路径上触发仿真脉冲，并实时追加模拟出的工程规格遥测日志
  const handleTriggerSignal = (signalKey: keyof InteractiveState['simulatingSignals']) => {
    // 1. 打开相应总线的亮起仿真状态
    setState(prev => ({
      ...prev,
      simulatingSignals: {
        ...prev.simulatingSignals,
        [signalKey]: true
      }
    }));

    // 2. 仿真生成高精确度的嵌入式中文工程诊断日志
    const timestamp = new Date().toISOString().slice(11, 19);
    let logMsg = '';
    switch (signalKey) {
      case 'camera':
        logMsg = `[DCMI 视频总线] [${timestamp}] 收到摄像头输入 DMA 图像更新中断 #244。拷贝 384KB 直驱数据到主控 RAM 帧缓存中。`;
        break;
      case 'lcd':
        logMsg = `[FMC 显示总线] [${timestamp}] FMC 接口 液晶屏屏刷更新完成。帧缓冲双存完成乒乓切换(静态闪存区间 swap)。`;
        break;
      case 'ultrasonic':
        logMsg = `[输入捕获定时器] [${timestamp}] 捕获到测距回响上升沿跳变信号。脉宽持续: 1140us。解算出避障安全红线距离: 19.53 厘米。`;
        break;
      case 'wifi':
        logMsg = `[SPI2 骨干网络] [${timestamp}] 遥测上行负载信令就绪: { "障碍物距离": 19.53, "识别目标": ["人"] }。启动高速无线通信传输。`;
        break;
      case 'voice':
        logMsg = `[UART2 语音合成] [${timestamp}] 主控串口下发指令报文: [“警告：前方20厘米内检测到障碍物！”]。SYN6288 开始合成输出自然语音。`;
        break;
    }

    setInferenceLogs(prev => [logMsg, ...prev.slice(0, 10)]);

    // 3. 3 秒后关闭该发光脉冲，以供下一次总线信号的重触发
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        simulatingSignals: {
          ...prev.simulatingSignals,
          [signalKey]: false
        }
      }));

      // 如果触动的是WiFi突发，那么3秒后自然联动发往上云，完成一整条硬件通路到分布式服务的回路仿真
      if (signalKey === 'wifi') {
        setState(prev => ({ ...prev, simulatingSignals: { ...prev.simulatingSignals, cloud: true } }));
        setInferenceLogs(prev => [
          `[云端联动 CLOUD] [${timestamp}] 远程云网物联网 Broker 响应 ACK(200)。完成 AES-256 高安全性多重信道数据解密归档。`,
          ...prev.slice(0, 10)
        ]);
        setTimeout(() => {
          setState(prev => ({ ...prev, simulatingSignals: { ...prev.simulatingSignals, cloud: false } }));
        }, 3000);
      }
    }, 3000);
  };

  // 开关或挂起智能分类环路的运行
  const toggleAiInference = () => {
    setAiInferenceRunning(prev => !prev);
    const logTag = aiInferenceRunning ? '[停止挂起 STOP]' : '[恢复装载 RUN]';
    setInferenceLogs(prev => [
      `${logTag} 主控芯片上搭载的 TinyML 特征目标分类网络运行状态已被${aiInferenceRunning ? 'PAUSED(挂起停止)' : 'RESUMED(恢复执行)'}。`,
      ...prev.slice(0, 10)
    ]);
  };

  // 获取当前选中的硬件节点
  const currentModule = MODULES_DATA.find(m => m.id === state.activeModuleId) || null;

  // 根据当前霓虹配色风格获取相应的 Tailwind 类名
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
      
      {/* 顶部专业工具级导航排首 */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-slate-900 border ${getThemeBorderClass(state.accentColor)} text-slate-200`}>
              <Cpu className={`h-6 w-6 ${getThemeTextClass(state.accentColor)} animate-pulse`} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-slate-400 tracking-widest uppercase">
                  STM32H7 嵌入式边缘人工智能硬件系统
                </span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white font-sans uppercase">
                嵌入式摄像机系统三维架构关系图
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3.5 self-stretch sm:self-auto justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-900">
            <div className="text-right hidden md:flex flex-col font-mono text-[10px] text-slate-500">
              <span>系统 CAD 编译版本: REV 3.4</span>
              <span>主板电路检测阻抗: 100% 匹配闭合</span>
            </div>
            
            <button 
              onClick={handlePrintMockup}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border ${getThemeBorderClass(state.accentColor)} text-xs ${getThemeTextClass(state.accentColor)} hover:bg-slate-800 transition-all font-mono cursor-pointer`}
              id="btn-print"
              title="将目前的总线及模型排版图输出为一张标准学术和竞赛演示海报格式"
            >
              <Download size={14} />
              导出海报大图 (PRINT)
            </button>
          </div>
        </div>
      </header>

      {/* 核心工作台主区块 / 栅格排布 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* 全尺寸面板空间布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* 左侧重点：三维交互 CAD 虚拟画布区域 (占用 8 栅格) */}
          <section className="lg:col-span-8 flex flex-col gap-4">
            
            {/* 头饰参数及快速说明 */}
            <div className={`flex items-center justify-between bg-gradient-to-r ${getThemeGlowBg(state.accentColor)} border-l-2 ${getThemeBorderClass(state.accentColor).replace('border-', 'border-l-')} pl-3 py-1`}>
              <div className="flex flex-col">
                <h2 className="text-sm font-semibold tracking-wider text-white font-mono uppercase">
                  3D 立体等轴测工程设计投影
                </h2>
                <span className="text-[10px] font-mono text-slate-500">
                  点击硬件芯片、换能探头或传感器。你也可以直接按住鼠标随意拖拽空间平面、上下滚动滑轮缩放。
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <Bookmark size={12} className="text-slate-500" />
                <span>极简高科技模型</span>
              </div>
            </div>

            {/* 核心等轴测视图舞台 */}
            <IsometricDiagram
              state={state}
              onHoverModule={handleHoverModule}
              onSelectModule={handleSelectModule}
              activeModuleId={state.activeModuleId}
            />

            {/* 演示用海报工程标注及设计细则附注 */}
            <div className="bg-slate-900/30 rounded-xl border border-slate-900 p-4 font-mono text-[11px] text-slate-400 space-y-3">
              <div className="flex items-start gap-2">
                <Info size={14} className="text-primary shrink-0 mt-0.5 text-cyan-400" />
                <p className="leading-relaxed">
                  <strong>学术竞赛海报工程附注:</strong> 本三维交互关系图采用 30° 精准等轴测空间算法离线渲染生成。
                  为了确保能在竞赛展示展板上维持精简、纯粹且高质感的学术海报规格，
                  <strong>制图主干上无任何刻板繁冗的文字标签标识</strong>。
                  所有外围总线和板载电容线路一目了然，您可以直接在屏幕上对元件进行点控，在右侧检测台查看完整的引脚分配详情。
                </p>
              </div>
              
              {/* 总线配色图例指引 */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-1 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-500 shadow-[0_0_6px_rgba(236,72,153,0.6)]" />
                  <span>DCMI 高速摄像头视频总线</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.6)]" />
                  <span>FMC 24位并行 LCD 控制总线</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.6)]" />
                  <span>EXTI 第0组外部中断定时测距线</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                  <span>4位并行 SPI2 高速无线传输总线</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(249,115,22,0.6)]" />
                  <span>UART2 自然语音播报串口控制线</span>
                </div>
              </div>
            </div>

          </section>

          {/* 右侧重点：探测数据调试端与神经网络监控 HUD (占用 4 栅格) */}
          <section className="lg:col-span-4 flex flex-col gap-6">
            
            {/* 智能引脚及技术参数检测台 */}
            <div className="h-full">
              <ModuleInspector 
                module={currentModule} 
                accentColor={state.accentColor} 
              />
            </div>

            {/* 板载 TinyML 卷积神经网络参数监控仪 (人工仿真，极富极客质感) */}
            <div className="bg-slate-950 rounded-2xl border border-slate-900 p-4 space-y-3 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                <div className="flex items-center gap-1.5">
                  <Terminal size={14} className="text-slate-400 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold tracking-wider text-slate-300">
                    片上 TINYML CNN 核心诊断终端 
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
                  title="控制及挂起芯片主板上微型神经网络模型计算循环的触发"
                >
                  {aiInferenceRunning ? '运行中 RUNNING' : '已暂停 PAUSED'}
                </button>
              </div>

              {/* 日志监控输出框 */}
              <div className="bg-black/80 rounded-xl border border-slate-900 p-2.5 h-[135px] overflow-y-auto font-mono text-[9px] text-slate-400 space-y-1.5 custom-scrollbar relative">
                {inferenceLogs.map((log, index) => {
                  let color = 'text-slate-400';
                  if (log.includes('[DCMI')) color = 'text-pink-400';
                  else if (log.includes('[FMC') || log.includes('[LTDC')) color = 'text-yellow-400';
                  else if (log.includes('[TIMER') || log.includes('[输入捕获')) color = 'text-purple-400';
                  else if (log.includes('[CLOUD') || log.includes('[云端联动')) color = 'text-orange-400';
                  else if (log.includes('[SPI2') || log.includes('[SDIO')) color = 'text-emerald-400';
                  else if (log.includes('[UART2')) color = 'text-amber-500';
                  else if (log.includes('[初始化') || log.includes('[就绪') || log.includes('[恢复')) color = 'text-cyan-400';
                  else if (log.includes('[停止')) color = 'text-red-400';

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
                <span>模型参数加载规格: INT8 固化对称量化</span>
                <span>偏置漂移平衡补偿: 微控制器片上全自动对齐</span>
              </div>
            </div>

          </section>

        </div>

        {/* 覆盖在底部的大型交互仿真通信总线控制器 */}
        <TelemetryConsole
          state={state}
          onChangeAccent={handleChangeAccent}
          onToggleGrid={handleToggleGrid}
          onToggleScanline={handleToggleScanline}
          onChangeSpeed={handleChangeSpeed}
          onTriggerSignal={handleTriggerSignal}
        />

      </main>

      {/* 竞赛海报学术页脚标准，符合大会惯例 */}
      <footer className="border-t border-slate-900 bg-slate-950 py-5 mt-auto text-center">
        <div className="max-w-7xl mx-auto px-4 font-mono text-[10px] text-slate-500 space-y-1">
          <p className="uppercase tracking-wider">
            专为 2026 届嵌入式边缘人工智能硬件系统工程设计大赛成果汇报特制发布
          </p>
          <p className="opacity-75">
            全部三维硬件节点及交互轨迹均通过高效率 SVG 空间矩阵进行直接投影渲染，无任何第三方 WebGL 底层包约束，轻量高性能。
          </p>
        </div>
      </footer>
    </div>
  );
}
