export const CAPSULE_WIDTHS = [1000, 1100, 1200] as const;
export type CapsuleWidth = (typeof CAPSULE_WIDTHS)[number];

export type Vec3 = readonly [number, number, number];
export type CameraPose = {position: Vec3; target: Vec3; fov: number};

// 실측 전 추정값. 깊이와 높이는 사진에서 어림했다.
// 안쪽 폭은 "한눈에 넓어 보이게" 연출용으로 키웠고, 복도에서 보이는 문 폭(FACADE_WIDTH)과는 분리했다.
const VISUAL_WIDTH_SCALE = 1.3;
const FACADE_WIDTH = 1.08;
const ESTIMATED_DEPTH = 1.2;
const ESTIMATED_HEIGHT = 2.1;

export function capsuleDimensions(widthMm: CapsuleWidth) {
  const wall = 0.04;
  const innerWidth = (widthMm / 1000) * VISUAL_WIDTH_SCALE;
  const width = FACADE_WIDTH;
  const shellWidth = innerWidth + wall * 2;
  const innerDepth = ESTIMATED_DEPTH - wall;
  return {
    width,
    depth: ESTIMATED_DEPTH,
    height: ESTIMATED_HEIGHT,
    wall,
    innerWidth,
    shellWidth,
    innerDepth,
    frontZ: ESTIMATED_DEPTH / 2,
    backZ: -ESTIMATED_DEPTH / 2 + wall,
    doorWidth: width - 0.12,
    doorHeight: 1.98,
    deskHeight: 0.74,
    deskDepth: 0.78,
    shelfBottom: 1.36,
    shelfTop: 1.64,
    shelfDepth: 0.3,
  };
}
export type CapsuleDimensions = ReturnType<typeof capsuleDimensions>;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => value * value * (3 - 2 * value);
const mix = (from: number, to: number, amount: number) => from + (to - from) * amount;
const mixVec = (from: Vec3, to: Vec3, amount: number): Vec3 => [mix(from[0], to[0], amount), mix(from[1], to[1], amount), mix(from[2], to[2], amount)];

export function cameraPose(progress: number, dims: CapsuleDimensions): CameraPose {
  const f = dims.frontZ;
  const keyframes: {at: number; pose: CameraPose}[] = [
    {at: 0, pose: {position: [3.3, 1.6, f + 0.75], target: [0.3, 1.3, f + 0.05], fov: 55}},
    {at: 0.12, pose: {position: [0.7, 1.55, f + 1.2], target: [-0.05, 1.25, f], fov: 50}},
    {at: 0.5, pose: {position: [0.15, 1.5, f + 0.9], target: [0, 1.25, f - 0.6], fov: 58}},
    {at: 0.74, pose: {position: [0, 1.5, f + 0.2], target: [0, 1.02, -0.3], fov: 70}},
    {at: 1, pose: {position: [-0.12, 1.4, f - 0.1], target: [-0.16, 1.28, -0.5], fov: 52}},
  ];
  const p = clamp01(progress);
  const next = keyframes.findIndex(frame => frame.at >= p);
  if (next <= 0) return keyframes[0].pose;
  const a = keyframes[next - 1];
  const b = keyframes[next];
  const t = smooth((p - a.at) / (b.at - a.at));
  return {position: mixVec(a.pose.position, b.pose.position, t), target: mixVec(a.pose.target, b.pose.target, t), fov: mix(a.pose.fov, b.pose.fov, t)};
}

export const doorAngle = (opening: number) => smooth(clamp01(opening)) * 1.75;
