# Performance checklist

- [ ] Media uses optimized posters, responsive images, and lazy loading.
- [ ] Galleries use server-side pagination or controlled infinite loading.
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
- [ ] Design resumable/background bulk import before ingesting the full media archive.
