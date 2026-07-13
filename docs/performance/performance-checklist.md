# Performance checklist

- [x] Public event/gallery media uses responsive images, poster metadata, and lazy loading outside priority covers.
- [x] Admin media browsing uses server-side bounded pagination rather than loading the library at once.
- [x] Public gallery videos mount and play only after an explicit lightbox action; autoplay is disabled.
- [ ] Frontend bundles and third-party scripts are budgeted.
- [ ] API queries are bounded, paginated, and indexed.
- [x] Public website reads use no-store in development and a documented 60-second production revalidation window.
- [ ] Core Web Vitals and backend latency are measured before release.
- [x] Frontend foundations use Server Components by default and isolate client-only behavior.
- [x] Google fonts are self-hosted through `next/font` with swap behavior.
- [x] Shared UI source is compiled through workspace packages without duplicating app bundles.
- [x] Reduced-motion preferences disable non-essential foundation animations.
- [x] Admin media lists use bounded pagination with a maximum page size of 50.
- [x] Media binaries are streamed to external storage and are never loaded from PostgreSQL.
- [x] Admin uploads run sequentially and report per-item progress to limit concurrent memory and network pressure.
- [x] Admin media grids avoid video autoplay; details use metadata-only preload until playback is requested.
- [x] Event gallery management loads only one event's assignments and uses thumbnail previews without autoplay.
- [x] The assign-existing workflow searches approved media with bounded pagination instead of loading the global library.
- [x] Assignment updates use controlled sequential requests for the expected per-event media volume.
- [x] Public event and gallery list contracts return one cover rather than full media collections.
- [x] Public album pages reveal media in client-side batches of 24 and never render every video player up front.
- [x] Homepage public requests run concurrently and degrade independently when one endpoint is unavailable.
- [x] Homepage event and album collections are bounded before rendering and reuse cover projections only.
- [x] Homepage hero uses an optimized approved image/thumbnail or a media-free fallback; it never eagerly loads video.
- [x] Homepage editorial sections remain Server Components with no animation-library or client-state cost.
- [x] Sprint 13 motion uses CSS and one intersection-observed numeric counter client island; no animation dependency was added.
- [x] Branded route loading is text/CSS only and introduces no image or video request.
- [x] Cinematic card and media effects run only on fine pointers and are disabled for reduced-motion preferences.
- [x] The expanded gallery dialog preserves batched thumbnails and mounts video only after an explicit open action.
- [ ] Design resumable/background bulk import before ingesting the full media archive.

## Production launch verification

- [ ] Run clean production builds for website and admin from the reviewed lockfile with zero warnings.
- [ ] Measure Lighthouse and Core Web Vitals on homepage, event detail, and media-heavy gallery routes using production-like content and mobile throttling.
- [ ] Confirm list/grid videos never autoplay, gallery players mount only after intent, and posters/thumbnails are available for production videos.
- [ ] Confirm non-priority images remain lazy, responsive sizes are correct, and hero media does not exceed the approved mobile budget.
- [ ] Verify gallery batches remain bounded at 24 items and public API list caps remain effective with production-scale data.
- [ ] Verify development uses no-store while production public reads and sitemap-backed collections use the documented 60-second revalidation behavior.
- [ ] Establish image/video upload guidance and validate Cloudinary delivery formats, responsive transformations, and poster/thumbnail generation before bulk ingestion.
- [ ] Record frontend bundle budgets, API latency targets, cache-hit behavior, and monitoring alerts before launch.
