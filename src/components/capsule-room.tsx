"use client";
import {Canvas, useThree} from "@react-three/fiber";
import {useLayoutEffect, useMemo} from "react";
import {PerspectiveCamera} from "three";
import {cameraPose, capsuleDimensions, type CapsuleDimensions, type CapsuleWidth} from "./capsule-model";
import type {PanelAction, PanelState} from "./capsule-panel";
import CapsuleScene from "./capsule-scene";

type CapsuleRoomProps = {
  progress: number;
  opening: number;
  panel: PanelState;
  onAction: (action: PanelAction) => void;
  widthMm?: CapsuleWidth;
};

function CameraRig({progress, dims}: {progress: number; dims: CapsuleDimensions}) {
  const camera = useThree(state => state.camera);
  const invalidate = useThree(state => state.invalidate);
  useLayoutEffect(() => {
    const {position, target, fov} = cameraPose(progress, dims);
    camera.position.set(...position);
    camera.lookAt(...target);
    if (camera instanceof PerspectiveCamera) { camera.fov = fov; camera.updateProjectionMatrix(); }
    invalidate();
  }, [camera, invalidate, progress, dims]);
  return null;
}

export default function CapsuleRoom({progress, opening, panel, onAction, widthMm = 1000}: CapsuleRoomProps) {
  const dims = useMemo(() => capsuleDimensions(widthMm), [widthMm]);
  return <div className="room-canvas" role="img" aria-label="1인 스터디 캡슐 내부 3D 예시. 스탠드 왼쪽 패널이나 아래 컨트롤로 조명을 조작할 수 있습니다.">
    <Canvas shadows camera={{fov: 42, near: 0.05, far: 40}} dpr={[1, 1.75]} frameloop="demand" gl={{antialias: true, alpha: true}}>
      <CameraRig progress={progress} dims={dims} />
      <CapsuleScene dims={dims} progress={progress} opening={opening} panel={panel} onAction={onAction} />
    </Canvas>
  </div>;
}
