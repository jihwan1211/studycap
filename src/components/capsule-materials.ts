import {CanvasTexture, RepeatWrapping, SRGBColorSpace, type Texture} from "three";

export type CapsuleTextures = {oak: Texture; oakLight: Texture; oakDark: Texture; floor: Texture};

const SIZE = 512;

function seeded(seed: number) {
  let state = seed;
  return () => (state = (state * 16807) % 2147483647) / 2147483647;
}

function toTexture(canvas: HTMLCanvasElement, repeat: [number, number]) {
  const texture = new CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(...repeat);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function grain(context: CanvasRenderingContext2D, random: () => number, x0: number, x1: number, count: number, dark: string, light: string) {
  for (let i = 0; i < count; i++) {
    context.globalAlpha = 0.05 + random() * 0.17;
    context.strokeStyle = random() < 0.65 ? dark : light;
    context.lineWidth = 0.5 + random() * 1.6;
    const x = x0 + random() * (x1 - x0);
    const phase = random() * 6;
    const amplitude = 1 + random() * 3;
    context.beginPath();
    context.moveTo(x, 0);
    for (let y = 16; y <= SIZE; y += 16) context.lineTo(x + Math.sin(y * 0.018 + phase) * amplitude, y);
    context.stroke();
  }
  context.globalAlpha = 1;
}

function oakTexture(base: string, dark: string, light: string, seed: number, repeat: [number, number]) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE;
  const context = canvas.getContext("2d")!;
  const random = seeded(seed);
  context.fillStyle = base;
  context.fillRect(0, 0, SIZE, SIZE);
  for (let i = 0; i < 14; i++) {
    context.globalAlpha = 0.05 + random() * 0.07;
    context.fillStyle = random() < 0.5 ? dark : light;
    context.fillRect(random() * SIZE, 0, 20 + random() * 90, SIZE);
  }
  context.globalAlpha = 1;
  grain(context, random, 0, SIZE, 280, dark, light);
  return toTexture(canvas, repeat);
}

function plankTexture(repeat: [number, number]) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE;
  const context = canvas.getContext("2d")!;
  const random = seeded(29);
  const tones = ["#7d5a40", "#775539", "#835f44", "#725238"];
  const plank = SIZE / 4;
  for (let i = 0; i < 4; i++) {
    context.fillStyle = tones[i];
    context.fillRect(i * plank, 0, plank, SIZE);
    grain(context, random, i * plank + 4, (i + 1) * plank - 4, 40, "#4a2f1c", "#9a7550");
    context.fillStyle = "#24170e";
    context.globalAlpha = 0.22;
    context.fillRect(i * plank, 0, 2, SIZE);
    context.fillRect(i * plank, random() * SIZE, plank, 2);
    context.globalAlpha = 1;
  }
  const texture = toTexture(canvas, repeat);
  texture.center.set(0.5, 0.5);
  texture.rotation = Math.PI / 2;
  return texture;
}

let cache: CapsuleTextures | undefined;

export function capsuleTextures(): CapsuleTextures {
  cache ??= {
    oak: oakTexture("#c9a06a", "#7d5a32", "#e6c592", 7, [2, 2]),
    oakLight: oakTexture("#dcb98a", "#94703f", "#efd3a3", 13, [1, 1]),
    oakDark: oakTexture("#8d6340", "#4c3219", "#b3835a", 21, [1, 2]),
    floor: plankTexture([7, 2.5]),
  };
  return cache;
}
