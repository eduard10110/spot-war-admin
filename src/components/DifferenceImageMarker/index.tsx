import { CloseOutlined } from "@ant-design/icons";
import { Button, Typography } from "antd";
import { useCallback, useMemo, useRef, useState } from "react";

const { Text } = Typography;

/** Shared frame + image sizing for playfield previews (modal thumbnails, marker tool). */
export const differenceImageFrameClass =
  "relative mx-auto max-w-full overflow-hidden rounded-lg border-2 border-violet-200 bg-slate-900/5";

export const differenceImageClass =
  "block max-h-[min(360px,50vh)] w-full object-contain";

export interface SpotMarker {
  id: number;
  /** Percentage of the IMAGE CONTENT width  (0–100). */
  x: number;
  /** Percentage of the IMAGE CONTENT height (0–100). */
  y: number;
}

export interface DifferenceImageMarkerProps {
  imageUrl: string | null;
  markers: SpotMarker[];
  onChange: (next: SpotMarker[]) => void;
  title?: string;
}

// ---------------------------------------------------------------------------
// Image-content frame helpers (mirrors the game's computeFrame logic).
// ---------------------------------------------------------------------------

interface ContentFrame {
  /** Pixels from img-element left edge to image content left edge. */
  offX: number;
  /** Pixels from img-element top edge to image content top edge. */
  offY: number;
  /** Width of the rendered image content in pixels. */
  dispW: number;
  /** Height of the rendered image content in pixels. */
  dispH: number;
}

function buildFrame(
  boxW: number,
  boxH: number,
  natW: number,
  natH: number,
): ContentFrame | null {
  if (!boxW || !boxH || !natW || !natH) return null;
  const scale = Math.min(boxW / natW, boxH / natH);
  const dispW = natW * scale;
  const dispH = natH * scale;
  return {
    offX: (boxW - dispW) / 2,
    offY: (boxH - dispH) / 2,
    dispW,
    dispH,
  };
}

function roundPct(n: number): number {
  return Math.round(n * 100) / 100;
}

// ---------------------------------------------------------------------------

export default function DifferenceImageMarker({
  imageUrl,
  markers,
  onChange,
  title,
}: DifferenceImageMarkerProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [frame, setFrame] = useState<ContentFrame | null>(null);

  // Recompute the frame whenever the image is rendered / resized.
  const computeFrame = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const { width: boxW, height: boxH } = img.getBoundingClientRect();
    const { naturalWidth: natW, naturalHeight: natH } = img;
    setFrame(buildFrame(boxW, boxH, natW, natH));
  }, []);

  const nextId = useMemo(() => {
    if (!markers.length) return 1;
    return Math.max(...markers.map((m) => m.id)) + 1;
  }, [markers]);

  // ------------------------------------------------------------------
  // Click → image-content percent
  // We measure from the <img> element's bounding rect (not the wrapper
  // div) so that the 2 px wrapper border is never included.
  // ------------------------------------------------------------------
  const onImageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const img = imgRef.current;
      if (!img || !frame) return;

      const imgRect = img.getBoundingClientRect();
      // Click relative to the img element's top-left corner.
      const relX = e.clientX - imgRect.left;
      const relY = e.clientY - imgRect.top;

      // Subtract the letterbox/pillarbox offset to get image-content coords.
      const x = roundPct(((relX - frame.offX) / frame.dispW) * 100);
      const y = roundPct(((relY - frame.offY) / frame.dispH) * 100);

      // Ignore clicks in the letterbox area.
      if (x < 0 || x > 100 || y < 0 || y > 100) return;

      onChange([...markers, { id: nextId, x, y }]);
    },
    [frame, markers, nextId, onChange],
  );

  const remove = useCallback(
    (id: number) => {
      onChange(markers.filter((m) => m.id !== id));
    },
    [markers, onChange],
  );

  if (!imageUrl) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
        <Text type="secondary">
          Upload the playfield image first, then click on it to place difference
          spots.
        </Text>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {title ? (
        <Text strong className="block">
          {title}
        </Text>
      ) : null}
      <Text type="secondary" className="text-xs">
        Click on the image to add a spot. Coordinates are saved as % of the
        image content (not the container). Remove spots with ×.
      </Text>

      {/* Wrapper div — click target */}
      <div
        role="presentation"
        className={`${differenceImageFrameClass} cursor-crosshair`}
        onClick={onImageClick}
      >
        {/* The image fills the wrapper with object-contain */}
        <img
          ref={imgRef}
          src={imageUrl}
          alt="Playfield — click to mark differences"
          className={differenceImageClass}
          draggable={false}
          onLoad={computeFrame}
        />

        {/*
          Marker overlay — positioned to cover ONLY the image content area
          (i.e. excluding the letterbox/pillarbox bars).  Markers use
          left/top as % of THIS div, which equals % of the image content —
          the same coordinate system used by the game.
        */}
        {frame ? (
          <div
            className="pointer-events-none absolute"
            style={{
              left: frame.offX,
              top: frame.offY,
              width: frame.dispW,
              height: frame.dispH,
            }}
          >
            {markers.map((m) => (
              <div
                key={m.id}
                className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${m.x}%`, top: `${m.y}%` }}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <div
                  className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-violet-600 text-xs font-bold text-white shadow-md"
                  title={`Spot ${m.id} (${m.x}%, ${m.y}%)`}
                >
                  {m.id}
                  <button
                    type="button"
                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(m.id);
                    }}
                    aria-label={`Remove spot ${m.id}`}
                  >
                    <CloseOutlined />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {markers.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {markers.map((m) => (
            <Button key={m.id} size="small" onClick={() => remove(m.id)}>
              Remove spot {m.id} ({m.x}%, {m.y}%)
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
