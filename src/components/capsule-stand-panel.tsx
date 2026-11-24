"use client";
import {useMemo, useState} from "react";
import {CanvasTexture, SRGBColorSpace} from "three";
import {NOISE_STEPS, type PanelAction, type PanelState} from "./capsule-panel";

const WIDTH = 0.34;
const HEIGHT = 0.07;
const FACE_WIDTH = WIDTH - 0.02;
const SLOTS = 7;
const slotX = (index: number) => -FACE_WIDTH / 2 + (FACE_WIDTH * (index + 0.5)) / SLOTS;
const BUTTONS: {slot: number; action: PanelAction}[] = [
  {slot: 0, action: "power"}, {slot: 2, action: "brightness"}, {slot: 3, action: "color"},
  {slot: 4, action: "ceiling"}, {slot: 5, action: "supply"}, {slot: 6, action: "exhaust"},
];

function faceTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1400;
  canvas.height = 280;
  const c = canvas.getContext("2d")!;
  c.fillStyle = "#0c0e0f";
  c.fillRect(0, 0, 1400, 280);
  c.strokeStyle = c.fillStyle = "#dedede";
  c.lineWidth = 7;
  c.lineCap = "round";
  c.textAlign = "center";
  const bulb = (x: number, y: number) => {
    c.beginPath(); c.arc(x, y - 6, 30, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(x - 14, y + 34); c.lineTo(x + 14, y + 34); c.moveTo(x - 10, y + 48); c.lineTo(x + 10, y + 48); c.stroke();
  };
  for (let i = 0; i < SLOTS; i++) {
    const x = 100 + i * 200;
    const y = 150;
    if (i === 0) { c.beginPath(); c.arc(x, y, 36, -Math.PI * 0.35, Math.PI * 1.35 + 0.0); c.stroke(); c.beginPath(); c.moveTo(x, y - 46); c.lineTo(x, y - 6); c.stroke(); c.font = "26px sans-serif"; c.fillText("POWER", x, 60); }
    if (i === 1) { c.globalAlpha = 0.45; c.font = "26px sans-serif"; c.fillText("CALL", x, 60); c.beginPath(); c.arc(x, y, 34, 0, Math.PI * 2); c.stroke(); c.globalAlpha = 1; }
    if (i === 2) bulb(x, y);
    if (i === 3) { c.beginPath(); c.arc(x, y, 42, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.arc(x - 15, y - 10, 4, 0, Math.PI * 2); c.arc(x + 15, y - 10, 4, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(x, y + 2, 22, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); }
    if (i === 4) { c.beginPath(); c.moveTo(x - 38, y - 52); c.lineTo(x + 38, y - 52); c.stroke(); bulb(x, y + 6); }
    if (i === 5 || i === 6) { c.font = "bold 46px sans-serif"; c.fillText(i === 5 ? "IN" : "OUT", x, y + 18); }
  }
  c.font = "24px sans-serif";
  c.fillText("White Noise", 1210, 262);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function Hit({position, size, onPress}: {position: [number, number, number]; size: [number, number]; onPress: () => void}) {
  const [hover, setHover] = useState(false);
  return <mesh position={position}
    onClick={event => { event.stopPropagation(); onPress(); }}
    onPointerOver={event => { event.stopPropagation(); setHover(true); document.body.style.cursor = "pointer"; }}
    onPointerOut={() => { setHover(false); document.body.style.cursor = ""; }}>
    <planeGeometry args={size} />
    <meshBasicMaterial color="#ffffff" transparent opacity={hover ? 0.22 : 0} depthWrite={false} />
  </mesh>;
}

function Dot({position, on, color}: {position: [number, number, number]; on: boolean; color: string}) {
  return <mesh position={position}><sphereGeometry args={[0.0032, 10, 10]} /><meshStandardMaterial color={on ? color : "#2a2e2e"} emissive={color} emissiveIntensity={on ? 2.5 : 0} /></mesh>;
}

type StandPanelProps = {position: [number, number, number]; panel: PanelState; interactive: boolean; onAction: (action: PanelAction) => void};

export default function CapsuleStandPanel({position, panel, interactive, onAction}: StandPanelProps) {
  const face = useMemo(faceTexture, []);
  const faceZ = 0.0305;
  const statusY = -HEIGHT / 2 + 0.009;
  const toggles: [number, boolean][] = [[0, panel.standOn], [4, panel.ceilingOn], [5, panel.supplyOn], [6, panel.exhaustOn]];
  return <group position={position}>
    <mesh><boxGeometry args={[WIDTH, HEIGHT, 0.06]} /><meshStandardMaterial color="#eceee9" roughness={0.35} /></mesh>
    <mesh position={[0, 0, faceZ]}><planeGeometry args={[FACE_WIDTH, HEIGHT - 0.016]} /><meshBasicMaterial map={face} toneMapped={false} /></mesh>
    {[0, 1, 2, 3].map(i => <Dot key={i} position={[slotX(2) - 0.0135 + i * 0.009, HEIGHT / 2 - 0.0135, faceZ + 0.001]} on={panel.standOn && i < panel.level} color="#ff2a1a" />)}
    {toggles.map(([slot, on]) => <Dot key={slot} position={[slotX(slot), statusY, faceZ + 0.001]} on={on} color="#6dff9a" />)}
    <group position={[WIDTH / 2 - 0.045, -HEIGHT / 2 - 0.018, 0]} rotation={[0, (panel.noise / (NOISE_STEPS + 1)) * Math.PI * 2, 0]}>
      <mesh><cylinderGeometry args={[0.017, 0.017, 0.03, 20]} /><meshStandardMaterial color="#9ea3a3" roughness={0.5} /></mesh>
      <mesh position={[0.012, -0.012, 0]}><boxGeometry args={[0.008, 0.012, 0.004]} /><meshStandardMaterial color="#e5e7e7" /></mesh>
    </group>
    {interactive && <>
      {BUTTONS.map(({slot, action}) => <Hit key={action} position={[slotX(slot), 0, faceZ + 0.003]} size={[FACE_WIDTH / SLOTS, HEIGHT]} onPress={() => onAction(action)} />)}
      <Hit position={[WIDTH / 2 - 0.045, -HEIGHT / 2 - 0.018, 0.02]} size={[0.045, 0.04]} onPress={() => onAction("noise")} />
    </>}
  </group>;
}
