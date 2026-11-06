"use client";

// 顔ぼかし処理のユーティリティ
// ブラウザのCanvas APIを使用して顔をぼかし処理

export class FaceBlurrer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.canvas = document.createElement("canvas");
      this.ctx = this.canvas.getContext("2d");
    }
  }

  // 顔検出領域をぼかし処理（簡易版：実際には顔検出モデルが必要）
  async blurFaces(
    imageData: ImageData,
    faceRegions: Array<{ x: number; y: number; width: number; height: number }>
  ): Promise<ImageData> {
    if (!this.canvas || !this.ctx) return imageData;

    // Canvasのサイズを設定
    this.canvas.width = imageData.width;
    this.canvas.height = imageData.height;

    // ImageDataをCanvasに描画
    this.ctx.putImageData(imageData, 0, 0);

    // 各顔領域をぼかし処理
    for (const region of faceRegions) {
      await this.blurRegion(region);
    }

    // ぼかし処理後のImageDataを返却
    return this.ctx.getImageData(0, 0, imageData.width, imageData.height);
  }

  private async blurRegion(region: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) {
    if (!this.canvas || !this.ctx) return;

    const { x, y, width, height } = region;

    // 顔領域を取得
    const faceData = this.ctx.getImageData(x, y, width, height);

    // ぼかし処理（簡易版：平均化）
    const blurredData = this.applyBlur(faceData, 10);

    // ぼかし処理後のデータを描画
    this.ctx.putImageData(blurredData, x, y);
  }

  private applyBlur(imageData: ImageData, radius: number): ImageData {
    const { data, width, height } = imageData;
    const blurred = new Uint8ClampedArray(data.length);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0,
          g = 0,
          b = 0,
          count = 0;

        // 周囲のピクセルの平均を計算
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const idx = (ny * width + nx) * 4;
              r += data[idx];
              g += data[idx + 1];
              b += data[idx + 2];
              count++;
            }
          }
        }

        // 平均値を設定
        const idx = (y * width + x) * 4;
        blurred[idx] = r / count;
        blurred[idx + 1] = g / count;
        blurred[idx + 2] = b / count;
        blurred[idx + 3] = data[idx + 3]; // アルファ値は保持
      }
    }

    return new ImageData(blurred, width, height);
  }

  // 顔検出（簡易版：実際には顔検出モデルを使用）
  detectFaces(imageData: ImageData): Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }> {
    // 簡易版：画像の中央付近に顔があると仮定
    // 実際の実装では、顔検出モデル（如BlazeFace、Face-API.js）を使用
    const { width, height } = imageData;
    const centerX = width / 2;
    const centerY = height / 2;
    const faceSize = Math.min(width, height) * 0.3;

    return [
      {
        x: centerX - faceSize / 2,
        y: centerY - faceSize / 2,
        width: faceSize,
        height: faceSize,
      },
    ];
  }
}

// シングルトンインスタンス
export const faceBlurrer =
  typeof window !== "undefined" ? new FaceBlurrer() : null;
