"use client";
import {useEffect, useMemo} from "react";
import {BoxGeometry, ExtrudeGeometry, Shape, type Texture} from "three";
import {RoundedBoxGeometry} from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export type V3 = [number, number, number];

type BoxProps = {
  size: V3;
  position: V3;
  radius?: number;
  color?: string;
  map?: Texture;
  roughness?: number;
  metalness?: number;
  emissive?: string;
  emissiveIntensity?: number;
};

export function Box({size, position, radius = 0.004, color, map, roughness = 0.7, metalness = 0, emissive, emissiveIntensity}: BoxProps) {
  const [width, height, depth] = size;
  const geometry = useMemo(() => {
    const limit = Math.min(width, height, depth) / 2 - 0.0005;
    return radius > 0 && limit > 0.0008 ? new RoundedBoxGeometry(width, height, depth, 3, Math.min(radius, limit)) : new BoxGeometry(width, height, depth);
  }, [width, height, depth, radius]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh position={position} geometry={geometry} castShadow receiveShadow>
    <meshStandardMaterial color={color} map={map} roughness={roughness} metalness={metalness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
  </mesh>;
}

const STRIP_WIDTH = 0.1;
const STRIP_HEIGHT = 0.32;

function DoorStrip({x, top, z}: {x: number; top: number; z: number}) {
  const geometry = useMemo(() => {
    const half = STRIP_WIDTH / 2;
    const radius = 0.05;
    const shape = new Shape();
    shape.moveTo(-half, 0);
    shape.lineTo(half, 0);
    shape.lineTo(half, -STRIP_HEIGHT);
    shape.lineTo(-half + radius, -STRIP_HEIGHT);
    shape.quadraticCurveTo(-half, -STRIP_HEIGHT, -half, -STRIP_HEIGHT + radius);
    shape.lineTo(-half, 0);
    return new ExtrudeGeometry(shape, {depth: 0.004, bevelEnabled: false, curveSegments: 12});
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} position={[x, top, z]} castShadow receiveShadow><meshStandardMaterial color="#4d7396" roughness={0.45} /></mesh>;
}

export function BoothDoor({width, height, thickness}: {width: number; height: number; thickness: number}) {
  const front = thickness / 2;
  const handleX = width - 0.075;
  return <>
    <Box size={[width, height, thickness]} position={[width / 2, height / 2, 0]} radius={0.006} color="#e4decb" roughness={0.55} />
    <DoorStrip x={width - STRIP_WIDTH / 2} top={height} z={front - 0.001} />
    <Box size={[0.04, 0.05, 0.003]} position={[width - STRIP_WIDTH - 0.03, height - 0.1, front + 0.0005]} radius={0.001} color="#f4f2ea" roughness={0.8} />
    <mesh position={[handleX, 1.0, front + 0.026]} castShadow><capsuleGeometry args={[0.007, 0.13, 4, 10]} /><meshStandardMaterial color="#c3c9cb" metalness={0.9} roughness={0.28} /></mesh>
    {[0.065, -0.065].map(offset => <mesh key={offset} position={[handleX, 1.0 + offset, front + 0.013]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.006, 0.006, 0.026, 10]} /><meshStandardMaterial color="#aeb4b6" metalness={0.9} roughness={0.35} /></mesh>)}
    <mesh position={[handleX, 1.16, front + 0.002]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.013, 0.013, 0.006, 16]} /><meshStandardMaterial color="#b3b9bb" metalness={0.9} roughness={0.3} /></mesh>
  </>;
}
