/**
 * tldraw pulls its canvas fonts from cdn.tldraw.com by default. Crafty ships for
 * local and intranet use, so every font slot points at the self-hosted Inter
 * subset: no request leaves the machine, and `document.fonts` can reach a settled
 * state offline (a pending webfont also blocks screenshot stabilisation).
 *
 * Deliberate deviation from the vendor default, in the same family of choices as
 * not shipping proprietary artwork.
 */
const LOCAL_FONT = '/fonts/inter-latin.woff2';

export const BOARD_FONT_URLS: Record<string, string> = Object.fromEntries(
  ['draw', 'sans', 'serif', 'mono'].flatMap((family) =>
    ['', '_italic', '_bold', '_italic_bold'].map((suffix) => [`tldraw_${family}${suffix}`, LOCAL_FONT]),
  ),
);
