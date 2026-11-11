# Release validation — 2026-11-11

The maintainer authorized rc.1 publication, public-registry revalidation, and stable 2.0.0 publication only after successful checks.

## rc.1 preparation

- Includes the signed WebKit dialog keyboard fix from `81095f2`.
- Source coverage regenerated for `2.0.0-rc.1`: 76 tests; 99.04% lines, 95.12% branches, 97.83% functions, 98.52% statements.
- Fresh independent Vite/Next consumers are prepared for public-registry testing, without source aliases or repository file dependencies.
- Publication, registry revalidation and stable promotion remain pending in this snapshot. Final evidence will be added after those checks complete.

See `RC_VALIDATION.md` for the initial defect reproduction and local-fix evidence. No source coverage percentage includes browser test counts.
