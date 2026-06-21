export interface ModuleInfo {
  id: string;
  name: string;
  acronym: string;
  description: string;
  role: string;
  protocol: string;
  pins: string[];
  specs: { [key: string]: string };
  voltage: string;
  speed: string;
  status: 'idle' | 'transmitting' | 'receiving' | 'active' | 'error';
  color: string; // Neon accent hex/tailwind class
}

export type ThemeAccent = 'cyan' | 'magenta' | 'yellow' | 'red';

export interface InteractiveState {
  activeModuleId: string | null;
  accentColor: ThemeAccent;
  isGridVisible: boolean;
  isScanlineVisible: boolean;
  glowIntensity: number; // 0 to 5
  traceSpeed: 'slow' | 'normal' | 'fast';
  simulatingSignals: {
    camera: boolean;
    lcd: boolean;
    ultrasonic: boolean;
    wifi: boolean;
    cloud: boolean;
  };
}

export interface SignalEvent {
  id: string;
  source: string;
  target: string;
  payloadType: string;
  timestamp: string;
}
