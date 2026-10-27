import React from 'react';

/**
 * Full-viewport ambient background — sits behind everything.
 * Warm gold/amber gradients on a cream base.
 * Fixed position so it stays put during scroll.
 */
const PageBackground = () => {
  return (
    <>
      {/* Base ambient mesh (gradients on cream) */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-ambient-cream pointer-events-none"
      />

      {/* Very subtle grain/texture overlay — 2% opacity, barely visible */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 pointer-events-none opacity-[0.025] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
        }}
      />
    </>
  );
};

export default PageBackground;