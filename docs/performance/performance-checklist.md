# Performance checklist

- [ ] Media uses optimized posters, responsive images, and lazy loading.
- [ ] Galleries use server-side pagination or controlled infinite loading.
- [ ] Only intentional videos play, with reduced-data and reduced-motion concerns respected.
- [ ] Frontend bundles and third-party scripts are budgeted.
- [ ] API queries are bounded, paginated, and indexed.
- [ ] Caching behavior is explicit and observable.
- [ ] Core Web Vitals and backend latency are measured before release.
- [x] Admin media lists use bounded pagination with a maximum page size of 50.
- [x] Media binaries are streamed to external storage and are never loaded from PostgreSQL.
- [ ] Design resumable/background bulk import before ingesting the full media archive.
