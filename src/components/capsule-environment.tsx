"use client";
import {useEffect} from "react";
import {useThree} from "@react-three/fiber";
import {PMREMGenerator, type Texture} from "three";
import {RoomEnvironment} from "three/examples/jsm/environments/RoomEnvironment.js";

export default function SoftEnvironment({intensity, exposure}: {intensity: number; exposure: number}) {
  const gl = useThree(state => state.gl);
  const scene = useThree(state => state.scene);
  const invalidate = useThree(state => state.invalidate);
  useEffect(() => {
    const generator = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = generator.fromScene(room, 0.04);
    scene.environment = target.texture as Texture;
    invalidate();
    return () => {
      scene.environment = null;
      target.dispose();
      generator.dispose();
      room.dispose();
    };
  }, [gl, scene, invalidate]);
  useEffect(() => {
    scene.environmentIntensity = intensity;
    gl.toneMappingExposure = exposure;
    invalidate();
  }, [gl, scene, invalidate, intensity, exposure]);
  return null;
}
