# Arcway: Stablecoin Payments Website (Concept)

A design concept by Nova Digital Studio. Arcway is a fictional company; all fees, timings and volumes are concept figures and no real licences are implied.

## Stack
React 19 · TypeScript · Vite · React Router v7 (pre-rendered: `/`, `/developers`, `/404`) · Tailwind CSS v4 · React Three Fiber · GSAP ScrollTrigger · Lenis (desktop) · Vercel function (`api/demo.ts`).

## Run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in build/client
npm run bake     # re-bake the globe's land dots (only if you change the density)
```

## How the globe works
- **Dots**: `scripts/bake-globe.mjs` places points on a sunflower spiral and keeps only land (Natural Earth 110m via `world-atlas`, public domain). Output: `public/globe/dots-desktop.bin` (~17k dots, 66 KB) and `dots-phone.bin` (~7.4k, 29 KB). One `Points` draw call (`app/three/Globe.tsx`).
- **Arcs**: great-circle maths in `app/lib/geo.ts`. The payment arc is a tube revealed by `uProgress`; the network is 320 arcs (80 on phones) in one line buffer animated in the shader (`app/three/Arcs.tsx`).
- **Journey**: one scroll value drives the camera spline (above Lagos → behind the arc → over Berlin), the glass layers, the arc, the timer and the chip (`app/three/Director.tsx`, `app/lib/keys.ts`). Scrolling back rewinds the payment.
- **Payment chip**: real HTML placed on the arc tip every frame (`app/components/Controller.tsx`).
- **One clock**: R3F `frameloop="never"` advanced from the GSAP ticker that also steps Lenis, ScrollTrigger and the counters.
- **Phones**: fewer dots and arcs, frosted (not transmissive) glass, no atmosphere shell, antialiasing off, sticky "Send money" bar. Reduced motion / no WebGL: still poster.
- **Concept money**: rates in `app/lib/money.ts` are tuned so ₦15,750,000 lands as exactly €9,214.50.

## Replace before publishing
- Footer link "Work with Nova Digital Studio" points to https://novadigital.studio.
- `SITE.url` in `app/lib/site.ts` once deployed (OG image links use it).
