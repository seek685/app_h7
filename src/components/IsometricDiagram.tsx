import React, { useRef, useState } from 'react';
import { InteractiveState, ModuleInfo, ThemeAccent } from '../types';
import { MODULES_DATA } from '../data';

interface IsometricDiagramProps {
  state: InteractiveState;
  onHoverModule: (moduleId: string | null) => void;
  onSelectModule: (moduleId: string) => void;
  activeModuleId: string | null;
}

export const IsometricDiagram: React.FC<IsometricDiagramProps> = ({
  state,
  onHoverModule,
  onSelectModule,
  activeModuleId
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // 投影三维坐标映身到二维屏幕位置：
  // 采用标准等轴测视角变换（Isometric Transformation）：
  // screenX = (x - y) * cos(30)
  // screenY = (x + y) * sin(30) - z
  const cos30 = 0.8660254;
  const sin30 = 0.5;

  const project = (x: number, y: number, z: number) => {
    // 画布中央虚拟偏移量
    const cX = 380;
    const cY = 280;
    const screenX = cX + (x - y) * cos30;
    const screenY = cY + (x + y) * sin30 - z;
    return { x: screenX, y: screenY };
  };

  const getAccentColorHex = (accent: ThemeAccent): string => {
    switch (accent) {
      case 'cyan': return '#06b6d4';
      case 'magenta': return '#ec4899';
      case 'yellow': return '#eab308';
      case 'red': return '#f43f5e';
    }
  };

  const primaryAccent = getAccentColorHex(state.accentColor);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'path' || (e.target as HTMLElement).tagName === 'polygon' || (e.target as HTMLElement).tagName === 'ellipse') {
      // 允许点击具体矢量形状时直接触发事件，而不打断框体拖拽初始化
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    if (e.deltaY < 0) {
      setZoom(prev => Math.min(prev * zoomFactor, 2.5));
    } else {
      setZoom(prev => Math.max(prev / zoomFactor, 0.6));
    }
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // 用于在等轴测空间绘制立方体 (Box) 的高阶多边形生成器
  const renderBox = (
    id: string,
    x: number,
    y: number,
    z: number,
    dx: number,
    dy: number,
    dz: number,
    themeColor: string,
    isSelected: boolean,
    isHovered: boolean,
    customStyles?: {
      topFill?: string;
      leftFill?: string;
      rightFill?: string;
      showCircuitPattern?: boolean;
    }
  ) => {
    const xMin = x - dx / 2;
    const xMax = x + dx / 2;
    const yMin = y - dy / 2;
    const yMax = y + dy / 2;
    const zMin = z;
    const zMax = z + dz;

    // 投影立方体的 8 个对应顶点
    const vT1 = project(xMin, yMin, zMax);
    const vT2 = project(xMax, yMin, zMax);
    const vT3 = project(xMax, yMax, zMax);
    const vT4 = project(xMin, yMax, zMax);

    const vB1 = project(xMin, yMax, zMin);
    const vB2 = project(xMax, yMax, zMin);
    const vB3 = project(xMax, yMin, zMin);
    const vB4 = project(xMin, yMin, zMin);

    const ptString = (pts: { x: number; y: number }[]) => 
      pts.map(p => `${p.x},${p.y}`).join(' ');

    const strokeColor = isSelected 
      ? primaryAccent 
      : isHovered 
      ? themeColor 
      : 'rgba(51, 65, 85, 0.4)';
      
    const strokeWidth = isSelected ? 2.5 : isHovered ? 1.5 : 1;

    // 侧面阴影明暗器设置
    const topColor = customStyles?.topFill || `rgba(30, 41, 59, 0.85)`;
    const leftColor = customStyles?.leftFill || `rgba(15, 23, 42, 0.95)`;
    const rightColor = customStyles?.rightFill || `rgba(2, 6, 23, 0.95)`;

    return (
      <g 
        id={`block-${id}`}
        className="cursor-pointer transition-all duration-300"
        onMouseEnter={() => onHoverModule(id)}
        onMouseLeave={() => onHoverModule(null)}
        onClick={(e) => { e.stopPropagation(); onSelectModule(id); }}
        style={{ filter: isHovered || isSelected ? `url(#glow-${id})` : 'none' }}
      >
        {/* 动态生成的高亮发光滤镜声明 */}
        <defs>
          <filter id={`glow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={isSelected ? "8" : "4"} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 右侧面 (Right Face) */}
        <polygon 
          points={ptString([vT2, vT3, vB2, project(xMax, yMin, zMin)])} 
          fill={rightColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          className="transition-all duration-300"
        />

        {/* 左侧面 (Left Face) */}
        <polygon 
          points={ptString([vT3, vT4, vB1, vB2])} 
          fill={leftColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          className="transition-all duration-300"
        />

        {/* 顶面 (Top Face) */}
        <polygon 
          points={ptString([vT1, vT2, vT3, vT4])} 
          fill={topColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          className="transition-all duration-300"
        />

        {/* 芯片顶层动态集成电路走线纹理装饰 */}
        {customStyles?.showCircuitPattern && (
          <g opacity={isHovered || isSelected ? 0.8 : 0.4} className="pointer-events-none">
            {/* 核心处理器中央裸晶内正方形 */}
            <polygon 
              points={ptString([
                project(x - dx*0.3, y - dy*0.3, zMax + 0.5),
                project(x + dx*0.3, y - dy*0.3, zMax + 0.5),
                project(x + dx*0.3, y + dy*0.3, zMax + 0.5),
                project(x - dx*0.3, y + dy*0.3, zMax + 0.5),
              ])} 
              fill="rgba(15, 23, 42, 0.95)"
              stroke={isSelected ? primaryAccent : themeColor}
              strokeWidth={1}
            />
            {/* 内部设计走的金黄色交互性铜线排布线 */}
            <polyline
              points={ptString([
                project(x - dx*0.4, y - dy*0.1, zMax + 0.8),
                project(x - dx*0.25, y - dy*0.1, zMax + 0.8),
                project(x - dx*0.1, y - dy*0.25, zMax + 0.8),
              ])}
              fill="none"
              stroke={themeColor}
              strokeWidth={1.5}
            />
            <polyline
              points={ptString([
                project(x + dx*0.4, y + dy*0.1, zMax + 0.8),
                project(x + dx*0.25, y + dy*0.1, zMax + 0.8),
                project(x + dx*0.1, y + dy*0.25, zMax + 0.8),
              ])}
              fill="none"
              stroke={themeColor}
              strokeWidth={1.5}
            />
            {/* 多核晶片导热分布虚线 */}
            <line 
              x1={project(x - dx*0.2, y - dy*0.2, zMax + 0.8).x} 
              y1={project(x - dx*0.2, y - dy*0.2, zMax + 0.8).y}
              x2={project(x + dx*0.2, y + dy*0.2, zMax + 0.8).x} 
              y2={project(x + dx*0.2, y + dy*0.2, zMax + 0.8).y}
              stroke={primaryAccent}
              strokeWidth={0.8}
              strokeDasharray="2,2"
            />
          </g>
        )}
      </g>
    );
  };

  // 渲染垂直圆柱体 (例如镜头镜筒或声呐探头换能器)
  const renderCylinder = (
    id: string,
    x: number,
    y: number,
    zMin: number,
    zMax: number,
    r: number,
    themeColor: string,
    isSelected: boolean,
    isHovered: boolean,
    customFill?: string
  ) => {
    const steps = 16;
    const basePts: { x: number; y: number }[] = [];
    const topPts: { x: number; y: number }[] = [];

    // 计算并在等轴测空间内映射顶面、底面的圆周点集
    for (let i = 0; i <= steps; i++) {
      const angle = (i * 2 * Math.PI) / steps;
      const dx = r * Math.cos(angle);
      const dy = r * Math.sin(angle);
      basePts.push(project(x + dx, y + dy, zMin));
      topPts.push(project(x + dx, y + dy, zMax));
    }

    const strokeColor = isSelected ? primaryAccent : isHovered ? themeColor : 'rgba(71, 85, 105, 0.4)';
    const strokeWidth = isSelected ? 2 : isHovered ? 1.5 : 1;

    // 定位等轴测圆柱体侧壁投影的左、右极值顶点位置
    let leftIdx = 0;
    let rightIdx = 0;
    let minProjX = Infinity;
    let maxProjX = -Infinity;

    topPts.forEach((p, idx) => {
      if (p.x < minProjX) {
        minProjX = p.x;
        leftIdx = idx;
      }
      if (p.x > maxProjX) {
        maxProjX = p.x;
        rightIdx = idx;
      }
    });

    const sidePolygonPts = [
      topPts[leftIdx],
      ...topPts.slice(Math.min(leftIdx, rightIdx), Math.max(leftIdx, rightIdx) + 1),
      topPts[rightIdx],
      basePts[rightIdx],
      ...basePts.slice(Math.min(leftIdx, rightIdx), Math.max(leftIdx, rightIdx) + 1).reverse(),
      basePts[leftIdx]
    ];

    const ptString = (pts: { x: number; y: number }[]) => pts.map(p => `${p.x},${p.y}`).join(' ');

    return (
      <g 
        id={`cylinder-${id}`}
        className="cursor-pointer"
        onMouseEnter={() => onHoverModule(id)}
        onMouseLeave={() => onHoverModule(null)}
        onClick={(e) => { e.stopPropagation(); onSelectModule(id); }}
      >
        {/* 圆柱体侧壁外轮廓 */}
        <polygon
          points={ptString(sidePolygonPts)}
          fill={customFill || 'rgba(15, 23, 42, 0.92)'}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />

        {/* 等间距投影阴影辅助渐变线 */}
        {[0.25, 0.5, 0.75].map((ratio, idx) => {
          const midX = x + r * Math.cos(ratio * Math.PI - Math.PI/4);
          const midY = y + r * Math.sin(ratio * Math.PI - Math.PI/4);
          const pBottom = project(midX, midY, zMin);
          const pTop = project(midX, midY, zMax);
          return (
            <line
              key={idx}
              x1={pBottom.x}
              y1={pBottom.y}
              x2={pTop.x}
              y2={pTop.y}
              stroke="rgba(255,255,255,0.07)"
              strokeWidth={1}
              pointerEvents="none"
            />
          );
        })}

        {/* 覆盖在上层的顶盖圆盘 */}
        <polygon
          points={ptString(topPts)}
          fill="rgba(30, 41, 59, 1)"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />

        {/* 光学镜片内侧反射偏振（用于相机镜头折射效果渲染） */}
        {r > 10 && (
          <polygon
            points={ptString(topPts.map((p) => {
              // 适当向核心比例收紧以生成内圈
              const dx = (p.x - project(x, y, zMax).x) * 0.7;
              const dy = (p.y - project(x, y, zMax).y) * 0.7;
              return { x: project(x, y, zMax).x + dx, y: project(x, y, zMax).y + dy };
            }))}
            fill="url(#lensGloss)"
            stroke={themeColor}
            strokeWidth={0.8}
            opacity={0.8}
          />
        )}
      </g>
    );
  };

  // 动态总线铜线信号渲染 (曼哈顿直角布线 Manhattan Routing)
  const renderTrace = (
    source: { x: number; y: number; z: number },
    target: { x: number; y: number; z: number },
    color: string,
    isPulsing: boolean,
    pulseColor?: string
  ) => {
    // 标准曼哈顿直角折线路由算法 (X走线 -> 拐角 -> Y走线 -> 垂直高度对齐 Z)
    const p1 = project(source.x, source.y, source.z);
    
    // 对齐 X 轴的中间拐点
    const pMid = project(target.x, source.y, source.z);
    
    // 对齐 Y 轴的中间拐点 (加端点高度对齐)
    const pMid2 = project(target.x, target.y, source.z);

    const pTarget = project(target.x, target.y, target.z);

    const pathD = `M ${p1.x} ${p1.y} L ${pMid.x} ${pMid.y} L ${pMid2.x} ${pMid2.y} L ${pTarget.x} ${pTarget.y}`;

    return (
      <g className="pointer-events-none">
        {/* PCB 底板的暗色凹槽信号轨 */}
        <path
          d={pathD}
          fill="none"
          stroke="rgba(30, 41, 59, 0.4)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 核心高速发光铜线网络 */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={isPulsing ? 1.0 : 0.4}
          className="transition-all duration-300"
          style={{
            filter: isPulsing ? 'drop-shadow(0 0 5px ' + (pulseColor || color) + ')' : 'none'
          }}
        />
        {/* 数据包无限周期流动虚线特效 */}
        <path
          d={pathD}
          fill="none"
          stroke={isPulsing ? (pulseColor || primaryAccent) : color}
          strokeWidth={isPulsing ? 2.2 : 1.8}
          strokeDasharray={isPulsing ? "8, 16" : "6, 24"}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={isPulsing ? 1 : 0.6}
        >
          <animate
            attributeName="stroke-dashoffset"
            values="100;0"
            dur={state.traceSpeed === 'fast' ? "1.5s" : state.traceSpeed === 'slow' ? "4s" : "2.5s"}
            repeatCount="indefinite"
          />
        </path>
      </g>
    );
  };

  return (
    <div 
      className="relative w-full h-[540px] bg-slate-950 rounded-2xl border border-slate-850 overflow-hidden select-none cursor-grab active:cursor-grabbing shadow-inner shadow-black"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      id="poster-diagram-stage"
    >
      {/* 蓝图背景网格层 */}
      {state.isGridVisible && (
        <div 
          className="absolute inset-0 opacity-[0.06] pointer-events-none transition-opacity duration-300"
          style={{
            backgroundImage: `
              linear-gradient(rgba(30, 144, 255, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(30, 144, 255, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: `${40 * zoom}px ${40 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`
          }}
        />
      )}

      {/* 赛博朋克扫描线 */}
      {state.isScanlineVisible && (
        <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-[0.035] mix-blend-overlay z-10" />
      )}

      {/* 暗黑边缘晕影环境遮罩 */}
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none z-10" />

      {/* 承载等轴测模型的根 SVG 容器 */}
      <svg
        className="w-full h-full"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
        onClick={() => onSelectModule('')}
      >
        <defs>
          {/* 发光材质和渐变色定义 */}
          <radialGradient id="lensGloss" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ec4899" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
          </radialGradient>

          <linearGradient id="cyberPCB" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#082f49" />
            <stop offset="60%" stopColor="#0c1d37" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          <linearGradient id="lcdGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#020617" />
            <stop offset="15%" stopColor="#1e1b4b" />
            <stop offset="85%" stopColor="#030712" />
          </linearGradient>

          <linearGradient id="cloudPedestal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(15, 23, 42, 0.9)" />
            <stop offset="100%" stopColor="rgba(30, 41, 59, 0.4)" />
          </linearGradient>
        </defs>

        {/* 1. 中央核心主板底板层 (蓝图样图最先渲染作为地板层) */}
        <polygon
          points={`${project(-280, -280, -8).x},${project(-280, -280, -8).y} 
                   ${project(280, -280, -8).x},${project(280, -280, -8).y} 
                   ${project(280, 280, -8).x},${project(280, 280, -8).y} 
                   ${project(-280, 280, -8).x},${project(-280, 280, -8).y}`}
          fill="rgba(10, 20, 40, 0.25)"
          stroke="rgba(51, 65, 85, 0.15)"
          strokeWidth={1}
          pointerEvents="none"
        />

        {/* 零地平面对称辅助轴线坐标系 */}
        <line
          x1={project(-280, 0, -8).x} y1={project(-280, 0, -8).y}
          x2={project(280, 0, -8).x} y2={project(280, 0, -8).y}
          stroke="rgba(30, 41, 59, 0.15)"
          strokeWidth={0.8}
          strokeDasharray="4,8"
          pointerEvents="none"
        />
        <line
          x1={project(0, -280, -8).x} y1={project(0, -280, -8).y}
          x2={project(0, 280, -8).x} y2={project(0, 280, -8).y}
          stroke="rgba(30, 41, 59, 0.15)"
          strokeWidth={0.8}
          strokeDasharray="4,8"
          pointerEvents="none"
        />

        {/* 2. 在线路板上渲染曼哈顿总线铜线信号轨迹 */}
        {/* DCMI trace: OV5640 摄像头传感器 -> STM32H7 (粉红配色传输线) */}
        {renderTrace(
          { x: -210, y: -60, z: 2 },
          { x: -60, y: -20, z: 2 },
          '#ec4899',
          state.simulatingSignals.camera || activeModuleId === 'ov5640'
        )}

        {/* FMC 8080 Bus Display Interface: STM32H7 主控 -> TFT 液晶面板 (金黄配色总线) */}
        {renderTrace(
          { x: -20, y: 60, z: 2 },
          { x: -60, y: 210, z: 2 },
          '#eab308',
          state.simulatingSignals.lcd || activeModuleId === 'lcd'
        )}

        {/* GPIO Trigger & Timer Capture: 超声波声呐 -> STM32H7 (紫色配合走线) */}
        {renderTrace(
          { x: 210, y: 80, z: 2 },
          { x: 60, y: 30, z: 2 },
          '#a855f7',
          state.simulatingSignals.ultrasonic || activeModuleId === 'ultrasonic'
        )}

        {/* SPI2 Bus: STM32H7 主控 -> ESP-WiFi 模块 (翠绿色走线组) */}
        {renderTrace(
          { x: 20, y: -210, z: 2 },
          { x: 20, y: -60, z: 2 },
          '#10b981',
          state.simulatingSignals.wifi || activeModuleId === 'wifi'
        )}

        {/* UART2 trace: STM32H7 → SYN6288 voice module (pink #ec4899 color, amber pulse) */}
        {renderTrace(
          { x: 40, y: -40, z: 2 },
          { x: 114, y: -80, z: 2 },
          '#ec4899',
          state.simulatingSignals.voice || activeModuleId === 'voice',
          '#f97316'
        )}

        {/* 射频天线信号：WiFi 模块 -> 远程物联网云 (空间气隙射频链路) */}
        {renderTrace(
          { x: 60, y: -240, z: 24 },
          { x: 300, y: -260, z: 120 },
          primaryAccent,
          state.simulatingSignals.wifi || state.simulatingSignals.cloud || activeModuleId === 'cloud'
        )}


        {/* 3. 渲染物理硬件元件三维网格节点 (由远及近 Z-Buffer 遮挡排序) */}

        {/* === WiFi 核心模块 === */}
        {renderBox(
          'wifi',
          60, -240, 0,
          56, 46, 4,
          '#10b981',
          activeModuleId === 'wifi',
          activeModuleId === 'wifi',
          { topFill: 'rgba(12, 74, 110, 0.45)', leftFill: 'rgba(8, 47, 73, 0.65)', rightFill: 'rgba(2, 44, 34, 0.85)' }
        )}
        {/* 金属屏蔽罩屏蔽金属罩外饰 */}
        {renderBox(
          'wifi',
          56, -244, 4,
          36, 28, 6,
          '#10b981',
          activeModuleId === 'wifi',
          activeModuleId === 'wifi',
          { topFill: 'rgba(71, 85, 105, 0.95)', leftFill: 'rgba(51, 65, 85, 0.98)', rightFill: 'rgba(30, 41, 59, 1.0)' }
        )}
        {/* 板载 PCB 黄金微带天线微缩走线 */}
        <path
          d={`M ${project(44, -225, 4.2).x} ${project(44, -225, 4.2).y} 
              L ${project(76, -225, 4.2).x} ${project(76, -225, 4.2).y}
              L ${project(76, -218, 4.2).x} ${project(76, -218, 4.2).y}
              L ${project(66, -218, 4.2).x} ${project(66, -218, 4.2).y}
              L ${project(66, -214, 4.2).x} ${project(66, -214, 4.2).y}
              L ${project(76, -214, 4.2).x} ${project(76, -214, 4.2).y}`}
          fill="none"
          stroke="#eab308"
          strokeWidth={1.5}
        />
        {/* WiFi 无线帧数据封包信号传递波动涟漪特效 */}
        {(state.simulatingSignals.wifi || activeModuleId === 'wifi') && (
          <g opacity={0.8} className="pointer-events-none">
            <path
              d={`M ${project(60, -240, 24).x - 12} ${project(60, -240, 24).y - 6} 
                  A 14 6 0 0 1 ${project(60, -240, 24).x + 12} ${project(60, -240, 24).y - 6}`}
              fill="none"
              stroke="#10b981"
              strokeWidth={1.5}
            >
              <animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite" />
              <animate attributeName="transform" type="scale" values="1; 1.6" dur="1.2s" repeatCount="indefinite" />
            </path>
            <path
              d={`M ${project(60, -240, 24).x - 24} ${project(60, -240, 24).y - 12} 
                  A 26 10 0 0 1 ${project(60, -240, 24).x + 24} ${project(60, -240, 24).y - 12}`}
              fill="none"
              stroke="#10b981"
              strokeWidth={1}
            >
              <animate attributeName="opacity" values="0;0.7;0" dur="1.2s" begin="0.3s" repeatCount="indefinite" />
            </path>
          </g>
        )}


        {/* === 远程云端物联网服务器 ===  */}
        {/* 浮空高架服务器基底托盘 */}
        <polygon
          points={`${project(270, -320, 110).x},${project(270, -320, 110).y}
                   ${project(370, -320, 110).x},${project(370, -320, 110).y}
                   ${project(370, -220, 110).x},${project(370, -220, 110).y}
                   ${project(270, -220, 110).x},${project(270, -220, 110).y}`}
          fill="url(#cloudPedestal)"
          stroke="rgba(30, 41, 59, 0.4)"
          strokeWidth={1}
          onClick={(e) => { e.stopPropagation(); onSelectModule('cloud'); }}
          className="cursor-pointer"
        />
        {/* 云端数据流集中架式机柜容器（三层刀片服务器结构） */}
        {renderBox(
          'cloud',
          320, -270, 112,
          56, 56, 24,
          '#f97316',
          activeModuleId === 'cloud',
          activeModuleId === 'cloud',
          { topFill: 'rgba(30, 41, 59, 0.95)', leftFill: 'rgba(15, 23, 42, 0.98)', rightFill: 'rgba(2, 6, 23, 1)' }
        )}
        {renderBox(
          'cloud',
          320, -270, 138,
          56, 56, 24,
          '#f97316',
          activeModuleId === 'cloud',
          activeModuleId === 'cloud',
          { topFill: 'rgba(30, 41, 59, 0.92)', leftFill: 'rgba(15, 23, 42, 0.96)', rightFill: 'rgba(2, 6, 23, 1)' }
        )}
        {/* 柜体侧面通风缝和频闪的云主机信号指示灯 */}
        <g opacity={0.9} pointerEvents="none">
          {/* 各机架硬件运行状态 LED 反馈亮点 */}
          <circle cx={project(300, -250, 126).x} cy={project(300, -250, 126).y} r={1.5} fill="#10b981" />
          <circle cx={project(310, -250, 126).x} cy={project(310, -250, 126).y} r={1.5} fill={state.simulatingSignals.cloud ? "#f97316" : "#3b82f6"} />
          <circle cx={project(320, -250, 126).x} cy={project(320, -250, 126).y} r={1.5} fill={state.simulatingSignals.cloud ? "#f43f5e" : "#1e293b"} />

          <circle cx={project(300, -250, 150).x} cy={project(300, -250, 150).y} r={1.5} fill="#10b981" />
          <circle cx={project(310, -250, 150).x} cy={project(310, -250, 150).y} r={1.5} fill={state.simulatingSignals.cloud ? "#f97316" : "#475569"} />
          <circle cx={project(320, -250, 150).x} cy={project(320, -250, 150).y} r={1.5} fill="#3b82f6" />
        </g>
        {/* 云端计算核心脑机人工智能神经网络浮动环绕圈 */}
        {(state.simulatingSignals.cloud || activeModuleId === 'cloud') && (
          <g opacity={0.65} className="pointer-events-none">
            <ellipse 
              cx={project(320, -270, 185).x} 
              cy={project(320, -270, 185).y} 
              rx={36 * cos30} ry={36 * sin30} 
              fill="none" 
              stroke="#f97316" 
              strokeWidth={1}
              strokeDasharray="6,4"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 320 185; 360 320 185"
                dur="10s"
                repeatCount="indefinite"
              />
            </ellipse>
            <circle cx={project(320, -270, 185).x} cy={project(320, -270, 185).y} r={2} fill="#ec4899" />
          </g>
        )}


        {/* === 中央 STM32H7 核心微控制器主板 === */}
        {/* 大型深邃微电子覆铜 PCB 节点板底座 */}
        <polygon
          points={`${project(-130, -130, -2).x},${project(-130, -130, -2).y} 
                   ${project(130, -130, -2).x},${project(130, -130, -2).y} 
                   ${project(130, 130, -2).x},${project(130, 130, -2).y} 
                   ${project(-130, 130, -2).x},${project(-130, 130, -2).y}`}
          fill="url(#cyberPCB)"
          stroke="rgba(8, 47, 73, 0.8)"
          strokeWidth={1.5}
          onClick={(e) => { e.stopPropagation(); onSelectModule('stm32h7'); }}
          className="cursor-pointer"
        />

        {/* 环绕电路底板的金色电源防护安全切线纹理 */}
        <polygon
          points={`${project(-124, -124, -0.5).x},${project(-124, -124, -0.5).y} 
                   ${project(124, -124, -0.5).x},${project(124, -124, -0.5).y} 
                   ${project(124, 124, -0.5).x},${project(124, 124, -0.5).y} 
                   ${project(-124, 124, -0.5).x},${project(-124, 124, -0.5).y}`}
          fill="none"
          stroke="rgba(234, 179, 8, 0.45)"
          strokeWidth={0.8}
          pointerEvents="none"
        />

        {/* STM32H743 微控制器系统核心封装块 */}
        {renderBox(
          'stm32h7',
          0, 0, 0,
          94, 94, 12,
          '#06b6d4',
          activeModuleId === 'stm32h7',
          activeModuleId === 'stm32h7',
          { 
            topFill: 'rgba(9, 18, 36, 0.98)', 
            leftFill: 'rgba(5, 12, 26, 1.0)', 
            rightFill: 'rgba(2, 6, 16, 1.0)',
            showCircuitPattern: true
          }
        )}

        {/* 动态计算并渲染 32 颗高质感芯片金属 QFP 引脚对齐芯片四边缘 */}
        {Array.from({ length: 8 }).map((_, idx) => {
          const offset = -35 + idx * 10;
          const pStart = project(-47, offset, 0.1);
          const pEnd = project(-55, offset, -1);
          const pStartR = project(47, offset, 0.1);
          const pEndR = project(55, offset, -1);

          const pStartT = project(offset, -47, 0.1);
          const pEndT = project(offset, -55, -1);
          const pStartB = project(offset, 47, 0.1);
          const pEndB = project(offset, 55, -1);

          return (
            <g key={idx} opacity={0.8} pointerEvents="none">
              {/* 左排物理引脚 */}
              <line x1={pStart.x} y1={pStart.y} x2={pEnd.x} y2={pEnd.y} stroke="#eab308" strokeWidth={1} />
              {/* 右排物理引脚 */}
              <line x1={pStartR.x} y1={pStartR.y} x2={pEndR.x} y2={pEndR.y} stroke="#eab308" strokeWidth={1} />
              {/* 上排物理引脚 */}
              <line x1={pStartT.x} y1={pStartT.y} x2={pEndT.x} y2={pEndT.y} stroke="#eab308" strokeWidth={1} />
              {/* 下排物理引脚 */}
              <line x1={pStartB.x} y1={pStartB.y} x2={pEndB.x} y2={pEndB.y} stroke="#eab308" strokeWidth={1} />
            </g>
          );
        })}


        {/* === SYN6288 语音合成模块 === */}
        {renderBox(
          'voice',
          130, -80, 0,
          32, 28, 4,
          '#f97316',
          activeModuleId === 'voice',
          activeModuleId === 'voice',
          { topFill: 'rgba(251, 146, 60, 0.45)', leftFill: 'rgba(194, 65, 12, 0.65)', rightFill: 'rgba(124, 45, 18, 0.85)' }
        )}
        {/* 扬声器喇叭细节设计 (Speaker Cone Detail on Top: x=130, y=-80, z=4) */}
        <g opacity={activeModuleId === 'voice' || state.simulatingSignals.voice ? 1.0 : 0.6} pointerEvents="none">
          <ellipse
            cx={project(130, -80, 4.2).x}
            cy={project(130, -80, 4.2).y}
            rx={8 * cos30}
            ry={8 * sin30}
            fill="rgba(15, 23, 42, 0.9)"
            stroke="#f97316"
            strokeWidth={1}
          />
          <ellipse
            cx={project(130, -80, 4.2).x}
            cy={project(130, -80, 4.2).y}
            rx={4 * cos30}
            ry={4 * sin30}
            fill="rgba(30, 41, 59, 1)"
            stroke="#fdba74"
            strokeWidth={0.8}
          />
          <line
            x1={project(124, -80, 4.3).x}
            y1={project(124, -80, 4.3).y}
            x2={project(136, -80, 4.3).x}
            y2={project(136, -80, 4.3).y}
            stroke="#f97316"
            strokeWidth={0.5}
            opacity={0.4}
          />
          <line
            x1={project(130, -84, 4.3).x}
            y1={project(130, -84, 4.3).y}
            x2={project(130, -76, 4.3).x}
            y2={project(130, -76, 4.3).y}
            stroke="#f97316"
            strokeWidth={0.5}
            opacity={0.4}
          />
        </g>
        {/* 语音信号触发时波纹动画 */}
        {(state.simulatingSignals.voice || activeModuleId === 'voice') && (
          <g opacity={0.85} className="pointer-events-none">
            <ellipse
              cx={project(130, -80, 4.2).x}
              cy={project(130, -80, 4.2).y}
              rx={12 * cos30}
              ry={12 * sin30}
              fill="none"
              stroke="#f97316"
              strokeWidth={1}
            >
              <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" />
              <animate attributeName="stroke-width" values="1;2.5;0.5" dur="1s" repeatCount="indefinite" />
            </ellipse>
            <ellipse
              cx={project(130, -80, 4.2).x}
              cy={project(130, -80, 4.2).y}
              rx={20 * cos30}
              ry={20 * sin30}
              fill="none"
              stroke="#f97316"
              strokeWidth={0.8}
              opacity={0.6}
            >
              <animate attributeName="opacity" values="0;0.7;0" dur="1s" begin="0.3s" repeatCount="indefinite" />
            </ellipse>
          </g>
        )}


        {/* === OV5640 摄像头多焦视觉传感器模块 === */}
        {renderBox(
          'ov5640',
          -220, -50, 0,
          56, 56, 5,
          '#ec4899',
          activeModuleId === 'ov5640',
          activeModuleId === 'ov5640',
          { topFill: 'rgba(30, 20, 36, 0.85)', leftFill: 'rgba(15, 10, 24, 0.9)', rightFill: 'rgba(2, 6, 23, 0.95)' }
        )}
        {/* 传感器紧密黑色抗强震密封盒底盘 */}
        {renderBox(
          'ov5640',
          -220, -50, 5,
          36, 36, 8,
          '#ec4899',
          activeModuleId === 'ov5640',
          activeModuleId === 'ov5640',
          { topFill: 'rgba(15, 23, 42, 0.95)', leftFill: 'rgba(30, 41, 59, 0.98)', rightFill: 'rgba(15, 23, 42, 1.0)' }
        )}
        {/* 三维圆柱镜头主镜壳体 (Cylinder) */}
        {renderCylinder(
          'ov5640',
          -220, -50, 13, 34,
          14,
          '#ec4899',
          activeModuleId === 'ov5640',
          false,
          'rgba(15, 23, 42, 0.98)'
        )}
        {/* 顶部镜口调节黄金质金属铜质对焦圈装饰 */}
        {renderCylinder(
          'ov5640',
          -220, -50, 34, 37,
          11,
          '#ec4899',
          activeModuleId === 'ov5640',
          activeModuleId === 'ov5640',
          'rgba(234, 179, 8, 0.85)'
        )}
        {/* 相机视口场角空间射影虚拟光锥渲染 */}
        {(state.simulatingSignals.camera || activeModuleId === 'ov5640') && (
          <polygon
            points={`${project(-220, -50, 37).x},${project(-220, -50, 37).y}
                     ${project(-400, -200, 120).x},${project(-400, -200, 120).y}
                     ${project(-320, 100, 120).x},${project(-320, 100, 120).y}`}
            fill="rgba(236, 72, 153, 0.12)"
            stroke="rgba(236, 72, 153, 0.3)"
            strokeWidth={0.8}
            pointerEvents="none"
          />
        )}


        {/* === SRF-SONIC 超声波雷达声呐探头测距端 === */}
        {renderBox(
          'ultrasonic',
          220, 80, 0,
          42, 70, 5,
          '#a855f7',
          activeModuleId === 'ultrasonic',
          activeModuleId === 'ultrasonic',
          { topFill: 'rgba(23, 15, 36, 0.85)', leftFill: 'rgba(12, 8, 20, 0.9)', rightFill: 'rgba(2, 6, 23, 0.95)' }
        )}
        {/* 发射声换能双圆柱体一：Transmitter (超声声波定向发射筒) */}
        {renderCylinder(
          'ultrasonic',
          220, 65, 5, 26,
          11,
          '#a855f7',
          activeModuleId === 'ultrasonic',
          activeModuleId === 'ultrasonic',
          'rgba(30, 41, 59, 0.95)'
        )}
        {/* 发射器前防尘过滤黑金属网栅 */}
        <polygon
          points={`${project(209, 65, 26.2).x},${project(209, 65, 26.2).y}
                   ${project(231, 65, 26.2).x},${project(231, 65, 26.2).y}
                   ${project(220, 76, 26.2).x},${project(220, 76, 26.2).y}
                   ${project(209, 54, 26.2).x},${project(209, 54, 26.2).y}`}
          fill="none"
          stroke="#a855f7"
          strokeWidth={0.5}
          opacity={0.4}
          pointerEvents="none"
        />

        {/* 接收声换能双圆柱体二：Receiver (声回响物理接收探测筒) */}
        {renderCylinder(
          'ultrasonic',
          220, 95, 5, 26,
          11,
          '#a855f7',
          activeModuleId === 'ultrasonic',
          activeModuleId === 'ultrasonic',
          'rgba(30, 41, 59, 0.95)'
        )}
        {/* 测距波束定向反射扩散波特效渲染 */}
        {(state.simulatingSignals.ultrasonic || activeModuleId === 'ultrasonic') && (
          <g opacity={0.8} className="pointer-events-none">
            {/* 三维前向发射环弧圈波纹特效 */}
            <path
              d={`M ${project(220, 80, 16).x + 16} ${project(220, 80, 16).y - 8} 
                  A 20 20 0 0 1 ${project(220, 80, 16).x + 40} ${project(220, 80, 16).y + 12}`}
              fill="none"
              stroke="#a855f7"
              strokeWidth={1.5}
            >
              <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" />
              <animate attributeName="stroke-width" values="1.5;3;1" dur="1s" repeatCount="indefinite" />
            </path>
            <path
              d={`M ${project(220, 80, 16).x + 32} ${project(220, 80, 16).y - 14} 
                  A 36 36 0 0 1 ${project(220, 80, 16).x + 64} ${project(220, 80, 16).y + 24}`}
              fill="none"
              stroke="#a855f7"
              strokeWidth={1}
            >
              <animate attributeName="opacity" values="0;0.7;0" dur="1s" begin="0.2s" repeatCount="indefinite" />
            </path>
          </g>
        )}


        {/* === RGB TFT 高清多显彩屏玻璃面板显示区域 === */}
        {renderBox(
          'lcd',
          -60, 210, 0,
          94, 60, 6,
          '#eab308',
          activeModuleId === 'lcd',
          activeModuleId === 'lcd',
          { topFill: 'rgba(15, 23, 42, 0.98)', leftFill: 'rgba(30, 41, 59, 0.95)', rightFill: 'rgba(2, 6, 23, 1.0)' }
        )}
        {/* 亮面玻璃镜片阵列显示器（LTDC 帧流投影点阵） */}
        <polygon
          points={`${project(-101, 185, 6.2).x},${project(-101, 185, 6.2).y}
                   ${project(-19, 185, 6.2).x},${project(-19, 185, 6.2).y}
                   ${project(-19, 235, 6.2).x},${project(-19, 235, 6.2).y}
                   ${project(-101, 235, 6.2).x},${project(-101, 235, 6.2).y}`}
          fill="url(#lcdGlow)"
          stroke={activeModuleId === 'lcd' ? primaryAccent : 'rgba(51, 65, 85, 0.8)'}
          strokeWidth={1}
          onClick={(e) => { e.stopPropagation(); onSelectModule('lcd'); }}
          className="cursor-pointer"
        />

        {/* 在显示屏镜面上显示模拟边缘 HUD 信息图形叠加（AI 图像诊断） */}
        <g pointerEvents="none" opacity={state.simulatingSignals.lcd || activeModuleId === 'lcd' ? 0.95 : 0.5}>
          {/* AI 目标检测边框模拟 (绿色矩形选定标志物) */}
          <polygon
            points={`${project(-85, 195, 6.4).x},${project(-85, 195, 6.4).y}
                     ${project(-45, 195, 6.4).x},${project(-45, 195, 6.4).y}
                     ${project(-45, 225, 6.4).x},${project(-45, 225, 6.4).y}
                     ${project(-85, 225, 6.4).x},${project(-85, 225, 6.4).y}`}
            fill="none"
            stroke="#10b981"
            strokeWidth={1}
          />
          {/* 拟物级目标对焦状态对焦边角标注 */}
          <line
            x1={project(-85, 195, 6.4).x} y1={project(-85, 195, 6.4).y}
            x2={project(-65, 195, 6.4).x} y2={project(-65, 195, 6.4).y}
            stroke="#10b981"
            strokeWidth={2}
          />

          {/* 右下角心率与信号刷新率等折线统计谱 */}
          <path
            d={`M ${project(-38, 202, 6.4).x} ${project(-38, 202, 6.4).y} 
                L ${project(-32, 212, 6.4).x} ${project(-32, 212, 6.4).y}
                L ${project(-26, 206, 6.4).x} ${project(-26, 206, 6.4).y}
                L ${project(-20, 222, 6.4).x} ${project(-20, 222, 6.4).y}`}
            fill="none"
            stroke={primaryAccent}
            strokeWidth={1.2}
          />
          {/* 终点闪烁极光指示点 */}
          <circle 
            cx={project(-20, 222, 6.4).x} 
            cy={project(-20, 222, 6.4).y} 
            r={1.5} 
            fill={primaryAccent}
          >
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>

      {/* 覆盖在上层的空间调节辅助控制器 */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 z-20">
        <button 
          onClick={resetView}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all font-mono cursor-pointer"
          id="btn-viewport-reset"
          title="重置缩放视角和拖拽中心位置"
        >
          重置视角
        </button>
        <div className="text-[10px] font-mono text-slate-500 bg-slate-900/40 px-2 py-1 rounded border border-slate-800/30">
          缩放: {Math.round(zoom * 100)}%
        </div>
      </div>

      <div className="absolute top-4 left-4 z-20 flex flex-col gap-1 pointer-events-none">
        <div className="text-xs font-mono tracking-wider font-semibold text-slate-400 uppercase">
          等轴测系统架构模型
        </div>
        <div className="text-[9px] font-mono text-slate-600">
          投影类型: 30°等轴测三维投影 // 画幅比: 1.4:1
        </div>
      </div>
    </div>
  );
};
