# BREAK & RESCUE

A Turkish, mobile-friendly rescue puzzle built on the prototype's existing polygon fracture engine. Open `index.html` directly, or run `node serve.cjs` and visit http://127.0.0.1:4173.

## Play

Touch/click the hammer, drag backward and release. Pull distance sets power; direction sets the strike angle. Touch the shell at a different horizontal position to move the hammer before pulling. Green/amber/red aim feedback and Turkish power descriptions explain the risk. Retry resets the attempt immediately without reloading.

| Level | Rescue | Lesson |
| --- | --- | --- |
| 1 · Ceramic | Key | A controlled pull opens the shell; only an extreme center blow damages the key. |
| 2 · Glass | Toy | A short edge hit protects the fragile toy. |
| 3 · Ice | Gem | Crack, then open; keep the falling/sliding gem over the narrow cushion. |
| 4 · Wood | Little creature | Repeated controlled hits on the green left plank; the heavy right support is dangerous. |
| 5 · Stone → glass | Gem | Strong outer-shell hit, followed by a separate gentle capsule hit. |

## Implementation

The original Voronoi cells, shared fracture walls, connected-piece rebuilding, textured shard rendering, material sounds and hammer flight remain. Crack stress now accumulates, nearby cracks guide subsequent hits, and a shell opens only after a meaningful portion separates. Ice cracks first; wood has fewer/larger pieces; glass fragments readily; stone resists weak hits. Core piece impulses use seeded randomness and the animation loop advances physics at a fixed 120 Hz.

Rescue bodies have gravity, horizontal motion, spin, slight bounce, material-dependent sliding and polygon-tested debris contacts. Damage uses stable thresholds with a warning band. Cutaway windows intentionally reveal objects inside opaque shells. This is a stylized 2D puzzle simulation: shell opening uses connected-piece area, rather than a full 3D cavity solver.

`LEVELS` holds material, body kind, safe zone, instructions and layer recipes. `shell`, `rescueImpact`, `releaseProps`, `stepProp` and `rescueVerdict` keep construction, impacts, body motion and outcome rules separate. The optional cake level and future mechanics are not shipped.

## Verification

Run `node test-game.cjs`. The 20 regression checks execute the real game script with mocked canvas/DOM, covering all five safe solutions, power/position/angle failures, material differences, separate layers, deterministic replay, touch-handler drag/release, cancellation, extra fingers, exhausted attempts and complete retry state.

Browser checks cover an actual drag-to-rescue interaction, result/next/retry controls, layout and console errors. Automated touch events exercise the input handlers; real phone hardware, haptics, audio quality and sustained device FPS still need hands-on verification. No runtime packages are required. Google Fonts are optional; system fonts work offline.
