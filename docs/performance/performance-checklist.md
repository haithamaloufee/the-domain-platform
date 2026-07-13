# Performance checklist

- [ ] Media uses optimized posters, responsive images, and lazy loading.
- [x] Admin media browsing uses server-side bounded pagination rather than loading the library at once.
- [ ] Only intentional videos play, with reduced-data and reduced-motion concerns respected.
- [ ] Frontend bundles and third-party scripts are budgeted.
- [ ] API queries are bounded, paginated, and indexed.
- [ ] Caching behavior is explicit and observable.
- [ ] Core Web Vitals and backend latency are measured before release.
- [x] Frontend foundations use Server Components by default and isolate client-only behavior.
- [x] Google fonts are self-hosted through `next/font` with swap behavior.
- [x] Shared UI source is compiled through workspace packages without duplicating app bundles.
- [x] Reduced-motion preferences disable non-essential foundation animations.
- [x] Admin media lists use bounded pagination with a maximum page size of 50.
- [x] Media binaries are streamed to external storage and are never loaded from PostgreSQL.
- [x] Admin uploads run sequentially and report per-item progress to limit concurrent memory and network pressure.
- [x] Admin media grids avoid video autoplay; details use metadata-only preload until playback is requested.
- [ ] Design resumable/background bulk import before ingesting the full media archive.
