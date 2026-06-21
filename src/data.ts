import { ModuleInfo } from './types';

export const MODULES_DATA: ModuleInfo[] = [
  {
    id: 'stm32h7',
    name: 'STM32H7 微控制器核心',
    acronym: 'STM32H743XI',
    description: '运行于 480 MHz 的高性能 ARM Cortex-M7 双精度浮点（FPU）微控制器。配备硬件图像 DSP 加速器、直驱图形内存的 Chrom-ART 引擎以及高密度本地 SRAM 块。',
    role: '中央 AI 引擎与数据处理枢纽。负责控制原始摄像头传感器总线，在片上运行微型机器学习（tinyML）模型（例如 MobileNet v2 或 YOLO-Nano），管理显示帧缓冲刷新，计算测距向量并协调无线数据的打包和云端上传。',
    protocol: '内部总线 / AXI 交叉网格控制器',
    pins: [
      'PC8..12 (SDIO_D0..D4)',
      'PD3, PG9 (SDIO_CMD/CLK)',
      'PE4..6, PI4..7 (DCMI_D0..D7)',
      'PA4, PH5 (DCMI_HSYNC/VSYNC)',
      'PK0..7, PJ0..15 (LTDC RGB888)',
      'PB8, PB9 (I2C1_SCL/SDA)',
      'PA0 (EXTI0_TRIG_INPUT)',
      'PA1 (TIM1_CH2_ECHO_INPUT)'
    ],
    specs: {
      '主频时钟速度': '480 MHz 高速频率',
      '处理器内核': 'ARM Cortex-M7 (32位架构)',
      '闪存空间 (Flash)': '2 Megabytes (双区闪存)',
      '本地静态内存': '1.4 Megabytes 总 SRAM',
      '边缘 AI 编译器': 'STM32Cube.AI 推理引擎',
      '图形加速': 'Chrom-ART DMA2D 图形加速器'
    },
    voltage: '3.3V IO电平 / 1.2V 逻辑核心',
    speed: '1027 DMIPS / 2.02 CoreMark/MHz',
    status: 'idle',
    color: '#06b6d4'
  },
  {
    id: 'ov5640',
    name: 'OV5640 摄像头模块',
    acronym: 'OV5640-CAM',
    description: '高性能 500 万像素 CMOS 彩色图像传感器，具有板载自动对焦机械结构、原始像素处理器和硬件图像压缩编码器 (JPEG/YUV/RGB)。',
    role: '视觉采集前端。负责直接捕获高帧率原始像素矩阵，并通过 10 线并口总线（数据 + 同步）实时输送到微控制器的数字摄像头接口 (DCMI) 控制器。',
    protocol: 'DCMI 并行总线 + I2C (SCCB 控制协议)',
    pins: [
      'DCMI_D0 .. DCMI_D7 (并行数据总线)',
      'DCMI_HSYNC, DCMI_VSYNC (行列同步)',
      'DCMI_PIXCLK (像素同步采样时钟)',
      'SCCB_SDA, SCCB_SCL (I2C 控制线)',
      'CAM_PWDN, CAM_RESET (电源使能复位 GPIO)'
    ],
    specs: {
      '传感器像素阵列': '2592 x 1944 有效像素 (5.0 MP)',
      '光格式尺寸': '1/4 英寸焦平面传感器',
      '帧率输出能力': '30 fps @ 1080p 全高清 / 60 fps @ 720p',
      '自动对焦控制': '板载数字音圈电机 (VCM) 驱动',
      '像素间距大小': '1.4 µm x 1.4 µm OmniBSI-2 技术',
      '输出色彩模式': 'RAW RGB, YUV422, 硬件 JPEG'
    },
    voltage: '2.8V 模拟 / 1.8V 数字核心 / 3.3V IO',
    speed: '24.00 MHz 原生输入时钟',
    status: 'idle',
    color: '#ec4899'
  },
  {
    id: 'lcd',
    name: 'RGB TFT 液晶显示面板',
    acronym: 'TFT-LCD-WVGA',
    description: '4.3英寸高分辨率液晶背光显示屏，采用清洁并口红绿蓝（RGB）信号走线，由低功耗微控制器的 Chrom-ART 内存直接传输控制器硬件直接驱动。',
    role: '参数监控与取景器 HUD 窗口输出。负责实时可视化摄像头采集的帧图像，叠加片上目标检测算法实时计算的边框、置信度以及传感器健康诊断参数。',
    protocol: '24位并行 RGB 信号 (LTDC 控制器驱动)',
    pins: [
      'LTDC_R0 .. LTDC_R7 (红色平行数据总线)',
      'LTDC_G0 .. LTDC_G7 (绿色平行数据总线)',
      'LTDC_B0 .. LTDC_B7 (蓝色平行数据总线)',
      'LTDC_CLK, LTDC_DE (数据使能采样时钟)',
      'LTDC_HSYNC, LTDC_VSYNC (行列同步引脚)',
      'LCD_BL_PWM (背光亮度调节 PWM 引脚)'
    ],
    specs: {
      '面板分辨率': '800 x 480WVGA 像素点阵',
      '色彩位深表达': '1670 万彩色深度 (24-bit RGB)',
      '屏幕背光控制': '12颗LED串联恒流 PWM 动态调光',
      '刷新率支撑': '60 Hz 逐行扫描更新',
      '显示驱动控制器': 'OTA7001 / ILI9806 高速控制器',
      '显示面板介质': 'IPS 宽可视角度液晶介质'
    },
    voltage: '3.3V 芯片供电 / 5.0V LED 背光恒流线',
    speed: '30.00 MHz LTDC 时钟频率',
    status: 'idle',
    color: '#eab308'
  },
  {
    id: 'ultrasonic',
    name: '超声波避障测距传感器',
    acronym: 'SRF-SONIC',
    description: '精密双换能器空间测距声呐阵列，可周期性发射 40 kHz 高频超声波，并通过高精度定时器捕捉回响反射。',
    role: '障碍物接近感知与空间测距。实时探测镜头前向锥形区域内的物理阻挡情况。将微秒级的占空比电平脉冲回馈给 STM32H7 的输入捕获定时器，以换算目标距离。',
    protocol: 'GPIO 触发电平 + 硬件定时器输入捕获反馈',
    pins: [
      'TRIG_LINE (PA0 外部中断触发引脚)',
      'ECHO_LINE (PA1 TIM1通道2输入捕获引脚)',
      'GND (系统模拟数字共用参考接地地线)',
      'VCC (VBUS 5.0V 传感器声源驱动电源)'
    ],
    specs: {
      '声呐换能频率': '40 kHz 定向偏振射频换能',
      '有效探测距离': '2 cm 至 450 cm 非接触测距',
      '系统测量精度': '3.0 mm 以内向量位移误差',
      '声呐开角范围': '15° 锥形发散立体探测面',
      '触发电平格式': '10 微秒(us)以上的高电平触发',
      '回响信号输出': '输出高电平，其脉宽对应声波往返时间'
    },
    voltage: '5.0V 供电驱动 / 3.3V 电平转换 GPIO 接口',
    speed: '343 米/秒 声纳速常温传导 (20ms周期刷新)',
    status: 'idle',
    color: '#a855f7'
  },
  {
    id: 'wifi',
    name: '高速无线 WiFi 网络模块',
    acronym: 'ESP-SDIO-NET',
    description: '超小尺寸低功耗 WiFi/蓝牙双模SoC网络套件，集成射频放大器、低噪声接收链、密码解密协处理器及板载微带天线。',
    role: '高速数据与物联网上云网关。通过 4-bit 并行多路复用 SDIO 接口，将片上压缩后的 JPEG 图像帧、目标检测元数据与实时测距值打包发送到无线控制链。',
    protocol: 'SDIO v2.0 (双边沿 4-bit 高速时钟总线)',
    pins: [
      'SDIO_CLK (PC12 主机同步同步时钟线)',
      'SDIO_CMD (PD2 命令通道双向帧控制器)',
      'SDIO_D0 .. SDIO_D3 (4位多路复用并行数据线)',
      'NET_EN (模块硬件关闭复位极性 GPIO)',
      'NET_INT (H7 高速事件通讯中断握手线)'
    ],
    specs: {
      '无线通信标准': '802.11 b/g/n Wifi 协议 (2.4 GHz)',
      '射频功率输出': '20.5 dBm 峰值传输辐射强度',
      '安全解密引擎': 'WPA3 硬件加密 / 原生 TLS 1.3 客户端支持',
      '总线传输带宽': '最大支持 50 MHz SDIO 高频时钟',
      '休眠极性损耗': '深睡状态极低功耗电流 < 15 µA',
      '天线形式': '阻抗匹配型板载 PCB 蛇形微带线天线'
    },
    voltage: '3.3V 独立低压差 (LDO) 稳压轨供电',
    speed: '50.00 Mbps SDIO 并行传输极限',
    status: 'idle',
    color: '#10b981'
  },
  {
    id: 'cloud',
    name: '边缘 AI 企业级物联网云平台',
    acronym: 'API-CLOUD-DB',
    description: '采用高可用负载集群架构部署的远程云计算服务中心，内设实时数据网关网路、高速时序缓存数据库及远程 OTA 控制中心。',
    role: '统一遥测归档与深度模型二次训练中心。整合接收来自于所有前端传感摄像机的检测日志，将其进行可视化处理，并作为样本库用于优化神经网络预测配置，支持远程固件在线 OTA 的分发。',
    protocol: 'HTTPS / JSON 核心网路接口 + MQTT 物联网底层订阅推送协议',
    pins: [
      '无线射频空口链路 (RF Air Connector)',
      '虚拟 RESTful API 通讯握手监听端口',
      'WebSocket 安全双工持续加密信道'
    ],
    specs: {
      '云端通讯协议': '物联网 MQTT 客户端双向链接 / RESTful 主动推送',
      '缓存数据库': '时序高并发 NoSQL 持久存储器',
      '中心微服务器': '按需扩容的远程边缘AI协同计算集群',
      '安全加密防护': 'SHA-256 私钥证书对数据全程数字签名保证',
      '在线固件分发': '多版本 OTA 升级用二进制对象存储桶',
      '用户统一权限': '基于标准 OAuth 令牌的双层验证报头机制'
    },
    voltage: '云服务端集群分布式高功耗电网供电',
    speed: '1.20 Gbps 高度物理下行骨干无线并发吞吐量',
    status: 'idle',
    color: '#f97316'
  },
  {
    id: 'voice',
    name: 'SYN6288 语音合成模块',
    acronym: 'SYN6288-TTS',
    description: '高集成度中文语音合成芯片，通过异步串口（UART）接收文本指令，转换成高清晰度的中文自然语音并输出。',
    role: '系统语音播报与紧急告警输出。接收 STM32H7 通过 UART 接口发送的传感器测量报警或目标检测识别语音文本，如“发现行人”、“注意距离较近”等，实时进行语音合成并驱动扬声器进行语音播报提示。',
    protocol: 'UART2 异步串口 (通信波特率默认 9600 bps)',
    pins: [
      'TXD_PIN (PB11 USART2 RXD 接收引脚)',
      'RXD_PIN (PB10 USART2 TXD 发送引脚)',
      'GND_PIN (系统数字模拟共用接地引脚)',
      'VCC_PIN (VBUS 5.0V 声输出及主板功放供电高电轨)'
    ],
    specs: {
      '核心合成芯片': 'SYN6288 中文语音合成 IC',
      '提示音播放': '支持 GB2312 与 GBK 多字符集成格式',
      '功放输出功率': '扬声器驱动输出最高达 1.2 Watt @ 8Ω',
      '音频工作电平': '5.0V 核心功放 / 3.3V TTL 电平安全兼容',
      '外接扬声器规格': '8欧姆 0.5-2W 宽波段高声微型扬声器',
      '串口交互速率': '稳定串口比特率 9600 bps / 并可最高配置到 115200'
    },
    voltage: '5.0V 功放供电 / 3.3V 串口通信电平',
    speed: '9600 bps 波特率传输通道',
    status: 'idle',
    color: '#f97316'
  }
];
