import {useEffect, useRef} from "react";

export const BRIGHTNESS_LEVELS = [0.25, 0.5, 0.75, 1] as const;
export const NOISE_STEPS = 4;

export const STAND_COLORS = {warm: "#ffe7ab", red: "#ff8a73", blue: "#78b4ff", green: "#8fe39a"} as const;
export type StandColor = keyof typeof STAND_COLORS;
const NEXT_COLOR: Record<StandColor, StandColor> = {warm: "red", red: "green", green: "blue", blue: "warm"};
export const COLOR_NAMES: Record<StandColor, string> = {warm: "기본", red: "붉은색", blue: "파란색", green: "초록색"};

export type Level = 1 | 2 | 3 | 4;
export type PanelState = {
  standOn: boolean;
  level: Level;
  color: StandColor;
  ceilingOn: boolean;
  supplyOn: boolean;
  exhaustOn: boolean;
  noise: number;
};
export type PanelAction = "power" | "brightness" | "color" | "ceiling" | "supply" | "exhaust" | "noise" | "reset";

export const initialPanel: PanelState = {standOn: true, level: 2, color: "warm", ceilingOn: true, supplyOn: false, exhaustOn: false, noise: 0};

// 스탠드가 꺼져 있을 때 밝기와 색 버튼이 어떻게 동작하는지는 확인되지 않아 무시하도록 했다.
export function panelReducer(state: PanelState, action: PanelAction): PanelState {
  switch (action) {
    case "power": return {...state, standOn: !state.standOn};
    case "brightness": return state.standOn ? {...state, level: (state.level === 4 ? 1 : state.level + 1) as Level} : state;
    case "color": return state.standOn ? {...state, color: NEXT_COLOR[state.color]} : state;
    case "ceiling": return {...state, ceilingOn: !state.ceilingOn};
    case "supply": return {...state, supplyOn: !state.supplyOn};
    case "exhaust": return {...state, exhaustOn: !state.exhaustOn};
    case "noise": return {...state, noise: (state.noise + 1) % (NOISE_STEPS + 1)};
    case "reset": return initialPanel;
  }
}

export const standIntensity = (state: PanelState) => (state.standOn ? BRIGHTNESS_LEVELS[state.level - 1] : 0);

const NOISE_GAIN = [0, 0.03, 0.07, 0.14, 0.25];

export function useWhiteNoise(step: number) {
  const engine = useRef<{context: AudioContext; gain: GainNode} | null>(null);
  useEffect(() => {
    if (step === 0 && !engine.current) return;
    if (!engine.current) {
      const context = new AudioContext();
      const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const gain = context.createGain();
      source.connect(gain).connect(context.destination);
      source.start();
      engine.current = {context, gain};
    }
    engine.current.gain.gain.value = NOISE_GAIN[step];
    void engine.current.context.resume();
  }, [step]);
  useEffect(() => () => {
    void engine.current?.context.close();
    engine.current = null;
  }, []);
}
