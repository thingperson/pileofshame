import type { SVGProps } from 'react';

type WordmarkVariant = 'full' | 'alone' | 'tagline';

interface WordmarkProps extends Omit<SVGProps<SVGSVGElement>, 'children' | 'viewBox'> {
  variant?: WordmarkVariant;
  title?: string;
}

// Brand colors — overridable via CSS custom properties so themes can retint.
// --wordmark-in   → the "IN" letters (default brand purple)
// --wordmark-body → "VENTORY FULL" (default brand teal)
// --wordmark-tagline → "get playing." (default brand pink)
const FILL_IN = 'var(--wordmark-in, #320b5e)';
const FILL_BODY = 'var(--wordmark-body, #1ae2c0)';
const FILL_TAGLINE = 'var(--wordmark-tagline, #ea2de1)';

// Tight viewBoxes hand-tuned from the SVGO'd source files in public/if-logos/
// (all sources share the 2880x1800 master canvas; we crop per variant).
// NOTE: the `tagline` variant's paths actually render "get playing.gg" (the full
// domain) — the final "g" of "playing" is fused with the ".gg" glyphs in path
// index 10 and can't be cleanly cropped. `full` variant hides the ".gg" via a
// narrower viewBox; `tagline` shows the domain. For "get playing." alone, use
// styled text, not this variant.
const VIEWBOX: Record<WordmarkVariant, string> = {
  full: '70 645 2580 510',
  alone: '70 645 2580 335',
  tagline: '820 900 2000 260',
};

// "VENTORY FULL" glyphs (teal body). Used by `full` and `alone`.
const BODY_PATH =
  'm1592.68 702.2 107.69-50.26h157.95v116.14h-113.18v-61.66h-40.12v102.2H1822v55.33h-116.98v108.96h-112.34zm294.79-50.26h113.18v265.64h39.7V651.94h113.61v320.97h-266.49zm296.05 0h112.34v266.07h97.13v54.9h-209.48V651.94Zm238.61 0h112.34v266.07h97.13v54.9h-209.48V651.94Z';

// "IN" glyphs (purple). Used by `full` and `alone`.
const IN_PATH =
  'M76.42 651.89h65.88v320.97H76.42zm91.22 51.1 64.62-51.1h91.22v320.97h-66.31V706.79h-23.23v266.07h-66.3zm181.17-51.1h64.62v266.07h23.23V651.89h65.88v271.98l-62.51 48.99h-91.22zm179.06 50.26 63.77-50.26h90.8v116.14h-65.88v-61.66h-23.23v102.2h67.99v55.33h-67.99v53.64h89.11v55.32H527.87zm179.91.84 64.62-51.1h91.22v320.97h-66.31V706.79h-23.23v266.07h-66.3zm216.23 3.81h-35.05v-54.9h137.26v54.9h-34.21v266.07h-67.99V706.8Zm127.54 0 66.3-54.9h88.69v266.49l-65.04 54.48h-89.95zm89.53 210.74V706.8h-23.23v210.74zm90.8-213.28 64.19-52.37h90.38v143.59l-36.74 40.54h36.74v136.84h-65.88V864.74h-22.81v108.12h-65.88zm88.69 100.51v-97.56h-22.81v97.56zm91.22 112.77h87.84v-54.9h-87.84V651.9h64.62v155.42h23.23V651.9h66.31v265.64l-64.19 55.32h-89.95v-55.32Z';

// "get playing." glyphs (pink tagline). Used by `full` and `tagline`.
// Sourced from wordmark-full.svg (tagline segment) — positioned around y≈1060-1150
// in the master canvas, which fits inside our `full` viewBox and is isolated in `tagline`.
const TAGLINE_PATHS: string[] = [
  'M858.81 1124.66v-38.47c0-13.05 4.4-18 21.98-18h23.77v1.37h-23.77c-16.21 0-20.61 4.4-20.61 16.62v38.47c0 11.95 4.81 16.35 23.35 16.35h25.97v-26.24h1.38v27.61h-27.34c-20.19 0-24.73-4.95-24.73-17.72Z',
  'M916.61 1148.11h-33.07c-18.8 0-30.45-3.92-30.45-23.45v-38.47c0-17.07 7.77-23.72 27.71-23.72h29.49v12.82H880.8c-14.88 0-14.88 3.42-14.88 10.9v38.47c0 6.85 0 10.62 17.63 10.62h20.24v-26.24h12.82v39.06Zm94.14-5.73h-46.3v-74.19h46.3v1.37h-44.92v34.48h33.8v1.38h-33.8V1141h44.92z',
  'M1016.48 1148.11h-57.75v-85.64h57.75v12.82h-44.93v23.04h33.8v12.82h-33.8v24.13h44.93zm64.6-78.54h-28.16v-1.37h57.7v1.37h-28.16v72.81h-1.38z',
  'M1088.18 1148.11h-12.82v-72.82h-28.17v-12.82h69.15v12.82h-28.16zm108.16-32.79v27.07h-1.38v-74.19h29.68c17.31 0 20.61 7.97 20.61 18.68v10.16c0 10.72-3.3 18.27-20.61 18.27h-28.3Zm28.3-1.38c16.21 0 19.23-7.01 19.23-16.9v-10.16c0-9.89-3.02-17.31-19.23-17.31h-28.3v44.38h28.3Z',
  'M1202.06 1148.11h-12.82v-85.63h35.4c17.72 0 26.33 7.98 26.33 24.41v10.16c0 10.3-2.73 24-26.33 24h-22.58v27.07Zm0-39.89h22.58c12.86 0 13.51-4.25 13.51-11.18v-10.16c0-7.21-.91-11.59-13.51-11.59h-22.58zm93.05-40.02h1.37v72.81h47.81v-27.06h1.37v28.44h-50.56v-74.19Z',
  'M1351.39 1148.11h-62.01v-85.64h12.82v72.81h36.37v-27.06h12.82zm98.54-29.36h-53.58v23.63h-1.38v-29.26c0-5.08.82-9.34 2.34-13.33l8.79-22.53c2.06-5.08 3.71-9.07 10.03-9.07h13.47c6.05 0 7.69 3.85 9.89 9.2l9.48 22.4c1.51 3.98 2.33 8.24 2.33 13.33v29.26h-1.37zm-53.58-1.37h53.58v-4.26c0-4.95-.82-9.07-2.2-12.78l-9.48-22.39c-2.06-4.81-3.57-8.38-8.65-8.38h-13.47c-5.49 0-7.01 3.57-8.79 8.24l-8.79 22.53c-1.37 3.71-2.2 7.83-2.2 12.78z',
  'M1457.02 1148.11h-12.82v-23.63h-42.13v23.63h-12.82v-34.99c0-5.53.89-10.56 2.71-15.36l8.81-22.58c2.19-5.4 5.15-12.71 15.36-12.71h13.47c9.95 0 12.98 7.37 15.19 12.75l9.46 22.34c1.9 5.01 2.79 10.03 2.79 15.56v34.99Zm-54.92-36.45h42.07c-.13-3.34-.73-6.4-1.81-9.32l-9.38-22.15c-2.09-4.89-2.37-4.89-3.38-4.89h-13.47c-1.41 0-1.7 0-3.45 4.56l-8.81 22.57c-1.05 2.84-1.64 5.9-1.78 9.23Zm123.79 7.23v23.49h-1.37v-23.49h-1.38c-3.98 0-7.01-1.65-10.03-5.77l-13.33-18.55c-2.06-2.75-2.06-6.6-2.06-10.58v-15.8h1.38v15.8c0 3.85.14 7.28 1.92 10.03l13.33 18.55c2.47 3.71 5.63 4.95 8.79 4.95h3.71c3.43 0 6.18-1.38 8.93-4.95l13.74-18.55c1.92-2.47 1.92-6.18 1.92-10.03v-15.8h1.38v15.8c0 3.98.14 7.69-2.06 10.58l-13.74 18.55c-3.02 3.98-5.91 5.77-10.17 5.77z',
  'M1531.61 1148.11h-12.82v-24.01c-3.95-1-7.28-3.48-10.29-7.59l-13.36-18.59c-3.14-4.18-3.14-9.35-3.14-13.92v-21.52h12.82V1084c0 2.94.08 5.49 1 6.91l13.17 18.33c1.52 2.27 2.88 2.56 4.14 2.56h3.71c1.26 0 2.46-.2 4.39-2.71l13.68-18.46c.8-1.03.8-4.26.8-6.62v-21.52h12.82v22.17c0 4.28.02 9.13-3.23 13.4l-13.69 18.49c-2.22 2.92-5.24 6.14-10.01 7.46v24.12Zm68.46-5.73V1141h21.29v-71.44h-21.29v-1.37h43.69v1.37h-21.02V1141h21.02v1.38z',
  'M1649.48 1148.11h-55.14v-12.83h21.3v-59.99h-21.3v-12.82h55.14v12.82h-21.02v59.99h21.02zm99.09-21.94v-57.98h1.37v74.19h-1.37v-14.15l-51.93-58.25c-.28-.28-.41-.41-.69-.41s-.27.27-.27.41v72.4h-1.38v-72.68c0-1.1.82-1.65 1.65-1.65s1.1.28 2.06 1.24z',
  'M1755.67 1148.11h-12.82v-17.69l-41.44-46.49v64.18h-12.82v-78.4c0-4.13 3.24-7.37 7.37-7.37 3.19 0 4.87 1.68 6.1 2.91l.24.25 40.56 45.63v-48.65h12.82v85.63Zm47.98-23.45v-38.47c0-13.05 4.4-18 21.98-18h23.77v1.37h-23.77c-16.21 0-20.61 4.4-20.61 16.62v38.47c0 11.95 4.81 16.35 23.35 16.35h25.97v-26.24h1.38v27.61h-27.34c-20.19 0-24.73-4.95-24.73-17.72Z',
  'M1861.45 1148.11h-33.07c-18.8 0-30.45-3.92-30.45-23.45v-38.47c0-17.07 7.77-23.72 27.71-23.72h29.49v12.82h-29.49c-14.88 0-14.88 3.42-14.88 10.9v38.47c0 6.85 0 10.62 17.63 10.62h20.24v-26.24h12.82v39.06Zm800.77-174.4c-2.39 0-4.36-.85-5.9-2.57-1.54-1.71-2.31-3.64-2.31-5.81 0-2.39.77-4.38 2.31-5.98s3.51-2.39 5.9-2.39 4.39.8 5.99 2.39c1.6 1.6 2.4 3.59 2.4 5.98 0 2.17-.8 4.1-2.4 5.81-1.59 1.72-3.59 2.57-5.99 2.57m42.88 27.95v-12.34h20.03l5.54-5.54v-7.31h-25.57l-12.72-12.72v-37.53l12.72-12.72h38.16v75.44l-12.72 12.72zm25.57-75.81h-20.15l-5.54 5.54v27.2l5.54 5.54h20.15v-38.29Zm34.75 75.81v-12.34h20.03l5.54-5.54v-7.31h-25.57l-12.72-12.72v-37.53l12.72-12.72h38.16v75.44l-12.72 12.72zm25.57-75.81h-20.15l-5.54 5.54v27.2l5.54 5.54h20.15v-38.29Z',
];

export default function Wordmark({
  variant = 'full',
  title,
  'aria-label': ariaLabel,
  role,
  ...rest
}: WordmarkProps) {
  const isDecorative = !ariaLabel && !title;
  const labelId = title ? `wordmark-title-${variant}` : undefined;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={VIEWBOX[variant]}
      role={role ?? (isDecorative ? 'presentation' : 'img')}
      aria-label={ariaLabel}
      aria-labelledby={labelId}
      aria-hidden={isDecorative || undefined}
      focusable="false"
      {...rest}
    >
      {title && <title id={labelId}>{title}</title>}
      {(variant === 'full' || variant === 'alone') && (
        <>
          <path d={BODY_PATH} fill={FILL_BODY} />
          <path d={IN_PATH} fill={FILL_IN} />
        </>
      )}
      {(variant === 'full' || variant === 'tagline') && (
        <g fill={FILL_TAGLINE}>
          {TAGLINE_PATHS.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      )}
    </svg>
  );
}
