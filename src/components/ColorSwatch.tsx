import React from 'react';
import type { PaintCodeHex } from '@/types';

interface ColorSwatchProps {
  hex: PaintCodeHex;
  size?: number;
  showBorder?: boolean;
  className?: string;
}

/**
 * ColorSwatch - Displays a realistic 3D paint color swatch
 *
 * Uses a three-color gradient (highlight, base, shadow) to simulate
 * the way metallic and pearl automotive paints reflect light at
 * different angles, creating depth and realism.
 *
 * @param hex - Three hex colors (highlight, base, shadow)
 * @param size - Diameter in pixels (default: 80)
 * @param showBorder - Show subtle border (default: true)
 */
export default function ColorSwatch({
  hex,
  size = 80,
  showBorder = true,
  className = '',
}: ColorSwatchProps) {
  const borderStyle = showBorder
    ? 'ring-2 ring-gray-300 ring-offset-2'
    : '';

  return (
    <div
      className={`rounded-full ${borderStyle} ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: `linear-gradient(-60deg, ${hex.highlight} 0%, ${hex.base} 50%, ${hex.shadow} 100%)`,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
      }}
      role="img"
      aria-label="Paint color swatch"
    />
  );
}
