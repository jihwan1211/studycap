"use client";
import {useMemo} from "react";
import {ExtrudeGeometry, Shape} from "three";
import Corridor from "./capsule-corridor";
import SoftEnvironment from "./capsule-environment";
import {capsuleTextures} from "./capsule-materials";
import {doorAngle, type CapsuleDimensions} from "./capsule-model";
import {STAND_COLORS, standIntensity, type PanelAction, type PanelState} from "./capsule-panel";
import {BoothDoor, Box} from "./capsule-parts";
import CapsuleStandPanel from "./capsule-stand-panel";

export type CapsuleSceneProps = {
  dims: CapsuleDimensions;
  progress: number;
  opening: number;
  panel: PanelState;
  onAction: (action: PanelAction) => void;
};

function deskGeometry(innerWidth: number, depth: number) {
  const half = innerWidth / 2;
  const shape = new Shape();
  shape.moveTo(-half, 0);
  shape.lineTo(half, 0);
  shape.lineTo(half, depth * 0.84);
  shape.bezierCurveTo(half * 0.3, depth * 1.05, -half * 0.2, depth * 0.82, -half, depth);
  shape.lineTo(-half, 0);
  return new ExtrudeGeometry(shape, {depth: 0.026, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.002, bevelSegments: 2, curveSegments: 24});
}

export default function CapsuleScene({dims, progress, opening, panel, onAction}: CapsuleSceneProps) {
  const textures = useMemo(capsuleTextures, []);
  const deskTop = useMemo(() => deskGeometry(dims.innerWidth, dims.deskDepth), [dims.innerWidth, dims.deskDepth]);
  const {width: w, shellWidth: sw, depth: d, height: h, wall, innerWidth: iw, frontZ: f, backZ, doorWidth, doorHeight, deskHeight, shelfBottom, shelfTop, shelfDepth} = dims;

  const exterior = 1 - Math.max(0, Math.min(1, (progress - 0.4) / 0.3));
  const level = standIntensity(panel);
  const lightColor = STAND_COLORS[panel.color];
  const ceilingLevel = panel.ceilingOn ? 1 : 0;
  const doorThickness = 0.035;
  const sideStrip = (w - doorWidth) / 2;
  const barY = shelfBottom - 0.05;
  const {oak, oakLight, oakDark, floor} = textures;

  return <>
    <SoftEnvironment intensity={0.1 + exterior * 0.14} exposure={1 - exterior * 0.3} />
    <fog attach="fog" args={["#141d16", 6, 16]} />
    <ambientLight intensity={0.06 + exterior * 0.08} />
    <directionalLight position={[3, 5.5, f + 4]} intensity={exterior * 0.35} color="#fff2e2" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} shadow-camera-near={0.5} shadow-camera-far={20} shadow-bias={-0.0004} shadow-normalBias={0.02} />
    {[-3.6, -1.2, 1.2, 3.6].map(x => <pointLight key={x} position={[x, h + 0.28, f + 0.75]} intensity={exterior * 1.0} distance={5} decay={1.6} color="#fff3de" />)}
    <pointLight position={[0, shelfBottom - 0.15, backZ + 0.75]} intensity={level * 2.6} color={lightColor} decay={1.6} castShadow shadow-mapSize={[512, 512]} shadow-bias={-0.002} shadow-normalBias={0.02} />
    <pointLight position={[0, h - 0.2, 0.05]} intensity={ceilingLevel * 1.2} color="#fff3dc" decay={1.6} castShadow shadow-mapSize={[512, 512]} shadow-bias={-0.002} shadow-normalBias={0.02} />
    <Box size={[0.5, 0.012, 0.26]} position={[0, h - wall - 0.006, 0.05]} color="#fff6e0" emissive="#fff6e0" emissiveIntensity={0.05 + ceilingLevel * 1.6} radius={0.004} />

    <Corridor dims={dims} textures={textures} />

    <Box size={[sw, 0.02, d - 0.002]} position={[0, 0.01, -0.001]} map={floor} roughness={0.4} radius={0} />
    <Box size={[wall, h, d - 0.002]} position={[-(sw - wall) / 2, h / 2, -0.001]} map={oak} radius={0.002} />
    <Box size={[wall, h, d - 0.002]} position={[(sw - wall) / 2, h / 2, -0.001]} map={oak} radius={0.002} />
    <Box size={[sw, h, wall]} position={[0, h / 2, -d / 2 + wall / 2]} map={oak} radius={0.002} />
    <Box size={[sw, wall, d - 0.002]} position={[0, h - wall / 2, -0.001]} map={oakLight} radius={0.002} />
    {[-1, 1].map(side => <Box key={side} size={[(sw - w) / 2, h, wall - 0.004]} position={[side * (w + sw) / 4, h / 2, f - wall / 2 - 0.002]} map={oak} radius={0.002} />)}
    <Box size={[sideStrip, h, wall]} position={[-(doorWidth + sideStrip) / 2, h / 2, f - wall / 2]} map={oakDark} />
    <Box size={[sideStrip, h, wall]} position={[(doorWidth + sideStrip) / 2, h / 2, f - wall / 2]} map={oakDark} />
    <Box size={[doorWidth, h - doorHeight, wall]} position={[0, doorHeight + (h - doorHeight) / 2, f - wall / 2]} map={oakDark} />
    <group position={[-doorWidth / 2, 0, f - doorThickness / 2 + 0.004]} rotation={[0, -doorAngle(opening), 0]}>
      <BoothDoor width={doorWidth} height={doorHeight} thickness={doorThickness} />
      <Box size={[0.22, 0.55, 0.006]} position={[doorWidth / 2, 1.3, -doorThickness / 2 - 0.003]} color="#b8cdd2" roughness={0.12} metalness={0.5} radius={0.002} />
      <Box size={[0.3, 0.012, 0.02]} position={[doorWidth / 2, 0.85, -doorThickness / 2 - 0.012]} color="#b5bbbd" roughness={0.3} metalness={0.85} radius={0.005} />
    </group>

    <mesh geometry={deskTop} position={[0, deskHeight, backZ]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow><meshStandardMaterial color="#e8d3b8" roughness={0.45} /></mesh>
    <Box size={[0.3, deskHeight - 0.03, dims.deskDepth - 0.1]} position={[-iw / 2 + 0.15, (deskHeight - 0.03) / 2, backZ + (dims.deskDepth - 0.1) / 2]} map={oakLight} />
    <Box size={[0.3, 0.02, 0.45]} position={[iw / 2 - 0.15, 0.22, backZ + 0.25]} map={oakLight} />

    <Box size={[iw, 0.025, shelfDepth]} position={[0, shelfBottom, backZ + shelfDepth / 2]} map={oakLight} />
    <Box size={[iw, 0.025, shelfDepth]} position={[0, shelfTop, backZ + shelfDepth / 2]} map={oakLight} />
    <Box size={[0.02, shelfTop - shelfBottom, shelfDepth]} position={[0, (shelfTop + shelfBottom) / 2, backZ + shelfDepth / 2]} map={oakLight} />

    <Box size={[0.5, 0.03, 0.05]} position={[0.14, barY, backZ + 0.08]} color={lightColor} emissive={lightColor} emissiveIntensity={0.05 + level * 2.4} radius={0.012} roughness={0.35} />
    <CapsuleStandPanel position={[-0.28, barY, backZ + 0.08]} panel={panel} interactive={progress > 0.6} onAction={onAction} />
    <Box size={[0.05, 0.035, 0.06]} position={[0.425, barY, backZ + 0.08]} color="#15191b" roughness={0.3} radius={0.006} />

    <group position={[0, 0, 0.3]}>
      <Box size={[0.46, 0.07, 0.46]} position={[0, 0.47, 0]} color="#1d2224" roughness={0.85} radius={0.025} />
      <Box size={[0.44, 0.52, 0.05]} position={[0, 0.78, 0.24]} color="#1d2224" roughness={0.85} radius={0.02} />
      <mesh position={[0, 0.25, 0]} castShadow><cylinderGeometry args={[0.03, 0.03, 0.4, 20]} /><meshStandardMaterial color="#a4aaaa" metalness={0.85} roughness={0.35} /></mesh>
      <Box size={[0.62, 0.03, 0.05]} position={[0, 0.03, 0]} color="#a4aaaa" metalness={0.85} roughness={0.35} radius={0.012} />
      <Box size={[0.05, 0.03, 0.62]} position={[0, 0.03, 0]} color="#a4aaaa" metalness={0.85} roughness={0.35} radius={0.012} />
    </group>
  </>;
}
