"use client";
import type {CapsuleDimensions} from "./capsule-model";
import type {CapsuleTextures} from "./capsule-materials";
import {BoothDoor, Box} from "./capsule-parts";

export const CORRIDOR_WIDTH = 1.5;
const COLUMNS = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];
const LENGTH = 12;
const LIGHT_XS = [-4.2, -2.1, 0, 2.1, 4.2];

function DoorRow({dims, textures, skipCenter}: {dims: CapsuleDimensions; textures: CapsuleTextures; skipCenter: boolean}) {
  const {width: w, height: h, wall, frontZ: f, doorWidth, doorHeight} = dims;
  const thickness = 0.035;
  return <>
    <Box size={[LENGTH, 0.35, wall + 0.001]} position={[0, h + 0.175, f - wall / 2 + 0.0005]} map={textures.oakDark} radius={0} />
    {COLUMNS.filter(k => !(skipCenter && k === 0)).map(k => <group key={k} position={[k * w, 0, 0]}>
      <Box size={[w, h, wall]} position={[0, h / 2, f - wall / 2]} map={textures.oakDark} />
      <group position={[-doorWidth / 2, 0, f - thickness / 2 + 0.004]}>
        <BoothDoor width={doorWidth} height={doorHeight} thickness={thickness} />
      </group>
    </group>)}
  </>;
}

export default function Corridor({dims, textures}: {dims: CapsuleDimensions; textures: CapsuleTextures}) {
  const {height: h, frontZ: f} = dims;
  const mid = f + CORRIDOR_WIDTH / 2;
  const ceilingY = h + 0.37;
  return <>
    <Box size={[LENGTH, 0.02, CORRIDOR_WIDTH]} position={[0, -0.01, mid]} map={textures.floor} roughness={0.5} radius={0} />
    <Box size={[LENGTH, 0.04, CORRIDOR_WIDTH]} position={[0, ceilingY, mid]} color="#d8d5cc" roughness={0.9} radius={0} />
    {LIGHT_XS.map(x => <mesh key={x} position={[x, ceilingY - 0.0205, mid]} rotation={[Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.075, 28]} />
      <meshStandardMaterial color="#ffffff" emissive="#fff4dc" emissiveIntensity={3} side={2} />
    </mesh>)}
    <Box size={[0.62, 0.07, 0.62]} position={[-1.05, ceilingY - 0.055, mid]} color="#f1efe8" roughness={0.5} radius={0.012} />
    <Box size={[0.4, 0.012, 0.4]} position={[-1.05, ceilingY - 0.094, mid]} color="#55595b" roughness={0.6} radius={0.004} />
    <DoorRow dims={dims} textures={textures} skipCenter />
    <group position={[0, 0, 2 * f + CORRIDOR_WIDTH]} rotation={[0, Math.PI, 0]}>
      <DoorRow dims={dims} textures={textures} skipCenter={false} />
    </group>
    {[-1, 1].map(side => <Box key={side} size={[0.1, h + 0.4, CORRIDOR_WIDTH]} position={[side * (LENGTH / 2 - 0.05), (h + 0.4) / 2, mid]} color="#3b4d63" emissive="#1f2d3d" emissiveIntensity={0.35} roughness={0.9} radius={0} />)}
  </>;
}
