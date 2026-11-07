import React from 'react';

/** The "ramble to lines" mark: a wave settling into three lines. See docs/BRAND.md. */
export const RamblyMark: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 256 256"
    fill="none"
    stroke="white"
    strokeWidth="28"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M44 72 C66 36 98 36 120 72 S174 108 196 72 C202 62 207 56 212 52" />
    <path d="M44 132 H212" />
    <path d="M44 180 H212" />
    <path d="M44 228 H140" />
  </svg>
);
