# Sprint 5D public performance and content ownership

Measured on 2026-07-18 against the local production-style content database. The Before route sample used the original Next development server; the After route sample used the built Next production server and the local database-backed ASP.NET API. Request, query, payload, and HTML-shape comparisons are direct. Route timing is reported without claiming a strict percentage improvement because the Next server modes differ.

## Root cause and final Homepage composition

The delayed middle was caused primarily by one page-level Suspense boundary: its fallback rendered the real Hero while the async Homepage subtree waited, and the Footer sat outside that boundary. React therefore sent Hero and Footer first and streamed the middle later. CMS section composition was an unnecessary data dependency, but it was not a sequential per-section fetch. Reveal CSS was not the source of the missing server markup, and no client effect fetched the section data.

The Homepage now awaits one consolidated server read and emits the Hero plus all eight sections in the first SSR response. API failure is isolated and still renders the static shells and code-owned empty states. The fixed, published visual order is:

1. `statistics`
2. `events`
3. `why`
4. `previous`
5. `gallery`
6. `services`
7. `partners`
8. `contact`

## Final ownership matrix

| Area                                                             | Final owner and decision                                                                 |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Header/Footer logo destination                                   | Code-owned fixed internal `/`; no database field                                         |
| Homepage primary CTA                                             | Code-owned label and audited `/events`; drop label and href                              |
| Homepage secondary CTA                                           | Code-owned label and audited `/gallery`; drop label and href                             |
| Homepage contact CTA                                             | Code-owned label and audited `/contact`; drop label and href                             |
| About reach-out CTA                                              | Code-owned label and audited `/contact`; drop label and href                             |
| Event booking destination                                        | Events CMS/business-owned `ExternalBookingUrl`; keep                                     |
| Event map destination                                            | Event-owned `MapUrl`; keep                                                               |
| Partner destinations                                             | Partner-owned external `WebsiteUrl`; keep                                                |
| Footer email, phone, WhatsApp, address, and social destinations  | Branding CMS-owned; keep                                                                 |
| Future campaign/discount destinations                            | Campaign/CMS-owned; never moved implicitly                                               |
| Homepage static copy and CTA labels                              | Typed `content/home.ts`; remove corresponding columns                                    |
| About static prose, CTA, and static SEO                          | Typed `content/about.ts`; remove corresponding columns                                   |
| Site name, tagline, and default SEO copy                         | Typed `content/site.ts`; remove corresponding columns                                    |
| Homepage section order and visibility                            | One typed Website constant; remove Admin controls, contracts, entity fields, and columns |
| Hero and floating-video media/control                            | Homepage CMS/Media-owned; keep                                                           |
| Statistics value and suffix                                      | CMS-owned; keep                                                                          |
| Statistics label and description                                 | Kept for deprecated endpoint compatibility; Homepage uses code-owned slot labels         |
| Logo, alternate logo, favicon, social image                      | Branding/Media-owned; bundled assets are immediate SSR/error fallbacks only              |
| About media, team, partners, events, gallery, and media metadata | CMS/Media-owned; keep                                                                    |
| Root `app/loading.tsx`                                           | Removed only after route audit; Homepage uses real SSR content, not a root skeleton      |
| About loader                                                     | Black, stable route-level shell                                                          |
| Events and event-detail loader                                   | Existing `events/loading.tsx` retained                                                   |
| Gallery and gallery-detail loader                                | Existing `gallery/loading.tsx` retained                                                  |
| Services and Contact loaders                                     | Synchronous routes; no dedicated loader                                                  |
| `/api/public/statistics`                                         | Retained and marked deprecated; compatibility tests/docs remain                          |
| `/api/public/partners`                                           | Retained and marked deprecated; compatibility tests/docs remain                          |
| Current event summary limit                                      | Exactly 2, matching the rendered design                                                  |
| Previous event summary limit                                     | Exactly 2, matching the rendered design                                                  |
| Selected gallery preview                                         | Exactly 1 collection cover plus counts                                                   |
| Album fallback limit                                             | Exactly 3 cards, matching the existing fallback                                          |
| Partners summary                                                 | All visible partners because the marquee consumes the full set                           |
| Statistics summary                                               | Slots 1-4 only                                                                           |

## Destructive migration

Migration `20260718061336_RemoveStaticPublicCopyOwnership` drops exactly 48 columns: 27 from `homepage_content`, 17 from `about_settings`, and 4 from `branding_settings`.

Homepage columns: `HeroEyebrow`, `HeroTitle`, `HeroAccent`, `HeroDescription`, `PrimaryCtaLabel`, `PrimaryCtaHref`, `SecondaryCtaLabel`, `SecondaryCtaHref`, `WhyTitle`, `WhyDescription`, `ServicesTitle`, `ServicesDescription`, `PartnersTitle`, `PartnersDescription`, `ContactTitle`, `ContactDescription`, `ContactCtaLabel`, `ContactCtaHref`, `StatisticsPhrase`, `EventsTitle`, `EventsDescription`, `PreviousEventsTitle`, `PreviousEventsDescription`, `GalleryTitle`, `GalleryDescription`, `SectionOrder`, and `DisabledSections`.

About columns: `HeroEyebrow`, `HeroHeading`, `HeroText`, `IntroStatement`, `StoryHeading`, `StoryText`, `StoryHighlight`, `TeamHeading`, `TeamText`, `PartnersHeading`, `PartnersText`, `ReachOutHeading`, `ReachOutText`, `ReachOutCtaLabel`, `ReachOutCtaHref`, `SeoTitle`, and `SeoDescription`.

Branding columns: `SiteName`, `BrandDescription`, `DefaultSeoTitle`, and `DefaultSeoDescription`.

The exact UTF-8 source values are committed at `docs/content/sprint-05d-static-copy.before.json`. Its SHA-256 is `69907A63341A1E54C94C508BA377482BF720C163E4621C533514EE0800B9ACD9`. `pnpm content:validate` deep-compares all 48 exported fields, nulls and line boundaries, validates the four internal CTA allowlist entries, and confirms the removed unused fields are explicitly accounted for.

The migration was applied to a restored clone and a fresh database. The clone retained 14 Events, 25 Media assets, 19 collection items, 3 collections, 10 Partners, and 4 Team members. `Down` restored the three tables from 40 to 88 columns; `Up` returned them to 40. The migration contains 48 drops, 48 reverse adds, no table/FK/index removal, and EF reports no pending model changes. The disposable databases and dump were removed after verification; the source database was unchanged.

## Public contracts and request/cache design

The Homepage response now contains only presentation media/control, four statistic slot values, two current event summaries, two previous event summaries, one bounded gallery preview, and visible partner summaries. Static copy, CTA destinations, section order, and disabled-section fields are absent. About returns presentation/media, team, and partners only. Branding returns dynamic media, contact details, and social links only.

A full repository search covered Website/Admin BFF code, tests, scripts, documentation, and generated-client locations for `/api/public/statistics` and `/api/public/partners`. Only compatibility API tests and documentation remain; there are no Website, BFF, script, or generated-client consumers. The endpoints remain available with `Deprecation: true` and no invented Sunset date.

Every server getter is `server-only` and exported through React `cache(...)`. `cache: "no-store"` still controls persistence; React cache provides argument-keyed deduplication within one Server Components request. The production integration test renders `/` twice against a counting API and proves one Homepage and one Branding execution per SSR request, including Branding use by metadata, Header, and Footer.

The `net8.0` backend was verified against the installed ASP.NET Core 8.0.29 runtime. It uses ASP.NET Core Output Cache with endpoint tags and a typed invalidator calling `IOutputCacheStore.EvictByTagAsync(tag, cancellationToken)`. Tags are `public:homepage`, `public:branding`, `public:about`, `public:events`, `public:gallery`, `public:partners`, `public:statistics`, and `public:media`. Homepage carries its events/gallery/partners/statistics/media dependency tags; About carries partners/media; Branding, Events, and Gallery carry media where applicable. Successful Homepage, Branding, About/team, event, gallery, partner, statistic, media assignment, media approval, media visibility, metadata, archive, and collection mutations evict their concrete dependency tags. The default in-process store remains appropriate for the current single-instance V1 deployment.

Service tests cover every mutation-to-tag mapping. An API integration test also primes the real Branding Output Cache, proves the second response reuses it, evicts `public:branding` through the concrete .NET 8 store API, and proves the next request executes the service again.

## Loader and branding isolation

The root layout is synchronous. Header immediately renders the bundled logo in the existing fixed dimensions; the dynamic CMS logo streams into that same box with the existing object-fit behavior and cannot change Header geometry. Branding failure returns the bundled fallback. Footer has an independent Suspense boundary with a stable black navigation/tagline fallback and no invented operational contact data. Footer or Branding failure cannot fail the Homepage route. The Homepage has no grey/card fallback, and all static headings exist in its initial HTML.

## Before and After measurements

| Measurement                            |                                               Before |                                                After |
| -------------------------------------- | ---------------------------------------------------: | ---------------------------------------------------: |
| `/` observed route time                |      median about 1,720 ms; 1,517-1,922 ms, Next dev |   median 771.9 ms; 686.2-924.5 ms, built Next server |
| Initial HTML                           |                                159,804-160,078 bytes |                                        133,120 bytes |
| Public API requests for SSR `/`        |                                                    7 |                        2: one Homepage, one Branding |
| EF database commands for SSR `/`       |                                                   20 |                                                   11 |
| Duplicate/consolidated Homepage getter |     six page-specific reads rather than one contract |  0 duplicates; the consolidated getter executes once |
| Homepage endpoint payload              | 4,711 bytes for the legacy non-consolidated response | 6,379 bytes for the complete consolidated read model |
| Homepage endpoint observed time        |                                             53-58 ms |                                  warm median 27.2 ms |
| Branding payload / warm time           |                measured as part of the old route set |                           490 bytes / median 16.6 ms |
| Initial HTML image elements            |                                          25, 22 lazy |                                          26, 24 lazy |
| Initial browser media requests         |         not isolated from the old full network trace |                                         6 at 390x844 |
| Initial video source                   |                         metadata preload was emitted |        no `<video src>`; floating source is deferred |
| Initial preloads                       |                                                    4 |                                                    3 |
| JavaScript                             |             about 4.13 MB from the development trace |           699,022 bytes across 11 production scripts |
| Initial section markers                |                    middle streamed after Hero/Footer |                  all 8 in initial HTML before Footer |
| Grey loader text                       |                     `Framing the experience` present |                                               absent |

The After browser observation used local, unthrottled headless Edge. Mobile LCP observations ranged from 496-804 ms and desktop from 496-536 ms. CLS was `0.0000` in the final mobile and desktop runs. The final mobile run recorded 31 initial network requests, 6 media requests, no request after the load-plus-two-second idle boundary, no console error, no page/hydration error, and no video source. These are local observations, not production field Web Vitals.

## Navigation and SSR regression proof

- Production HTML contains the Hero and all eight `data-home-section` markers before `<footer>`, with no `sectionOrder`, `disabledSections`, or grey loader text.
- On `/`, an unmodified logo activation closes the mobile menu, smoothly reaches `scrollY=0`, calls one `router.refresh()`, and does not create a new navigation entry.
- From `/about`, the real Next `Link` navigates to `/`, reaches `scrollY=0`, uses the route transition, and leaves no transition overlay.
- Ctrl/Cmd-click and middle-click are not intercepted by the same-route handler.
- The Header link remains keyboard accessible with `href="/"` and `aria-label="Go to The Domain homepage"`.
- Mobile 390x844 and desktop 1440x900 headless Edge runs produced no console/page errors and were visually inspected without horizontal or section-composition regressions.

## Verification commands

- `dotnet test TheDomain.Backend.sln --no-restore`: 130 Application, 22 Infrastructure, and 40 API tests passed.
- Website typecheck, ESLint, focused unit tests, and production build passed.
- Admin typecheck, ESLint, focused suites, and production build passed.
- `pnpm --filter @the-domain/website test:request-dedup` passed against the built Next server.
- `pnpm content:validate` passed all 48 fields and four CTA routes.
- Fresh/clone/Down/Up migration checks and `dotnet ef migrations has-pending-model-changes` passed.
- `scripts/performance/measure-homepage.ps1` and `collect-browser-metrics.mjs` reproduce the local route, payload, query, HTML, Web Vitals, idle, error, and logo checks.

## Focused runtime latency diagnosis

The follow-up audit used `scripts/performance/measure-runtime.ps1` against the unchanged
original `the_domain` database. Each mode used a fresh Backend process and one cold plus
five warm requests per target. The destructive 48-column migration was not applied.

### Logging isolation before the event-query change

| Target | Current Development cold | Reduced Development cold | Current warm median / max | Reduced warm median / max | Payload |
| --- | ---: | ---: | ---: | ---: | ---: |
| `/api/public/homepage` | 3,048.1 ms | 2,980.4 ms | 4.6 / 36.2 ms | 3.6 / 4.4 ms | 6,379 B |
| `/api/public/events/upcoming` | 275.1 ms | 151.8 ms | 4.4 / 13.6 ms | 6.0 / 6.9 ms | 4,658 B |
| `/api/public/events/featured` | 63.6 ms | 56.5 ms | 5.3 / 7.8 ms | 5.7 / 6.4 ms | 2,510 B |
| `/api/public/events/previous` | 30.1 ms | 66.7 ms | 3.5 / 5.7 ms | 3.6 / 6.6 ms | 1,074 B |
| `/` through Next dev | 6,628.9 ms | 9,379.8 ms | 3,891.0 / 5,505.7 ms | 5,294.0 / 6,588.5 ms | 163,316 B |
| `/events` through Next dev | 5,591.5 ms | 5,964.5 ms | 4,605.6 / 6,700.4 ms | 3,555.2 / 4,574.4 ms | 123,515 B |

Current Development logging emitted 189,003 bytes of Backend output for this run; the
specified reduced configuration emitted 32,327 bytes. The large reduction in output did
not materially change the cold Homepage request and did not consistently improve Next dev
routes, so Debug logging was an amplifier rather than the root cause. Development now keeps
application and ASP.NET Information logs, Output Cache Information logs, EF Warning logs,
and System Warning logs. Sensitive data logging remains disabled.

### Query and materialization evidence

Before the change, every public event list materialized the complete tracked event/media
graph and filtered it in memory. The local database contained 14 events, 28 event-media
assignments, and 25 media assets. The new read repository applies publication, lifecycle,
featured/Homepage predicates, ordering, and visual limits in SQL, projects one required
cover, and leaves the EF tracker empty.

| Cold request, Debug diagnostic logging | Commands before / after | SQL total before / after | Longest reader before / after |
| --- | ---: | ---: | ---: |
| Homepage | 9 / 9 | 295 / 372 ms | 993 / 53 ms |
| Upcoming | 2 / 1 | 13 / 6 ms | 90 / 1 ms |
| Featured | 2 / 1 | 5 / 6 ms | 43 / <1 ms |
| Previous | 2 / 1 | 7 / 3 ms | 11 / <1 ms |

The Homepage command count is unchanged because its bounded event union and bounded album
fallback replace the previous two-command split graph with two narrow commands. SQL duration
varied with local scheduling, but reader lifetime—the measurable upper bound containing row
materialization and fix-up—fell sharply. Public API payload sizes remained byte-identical.
Event details still use the full media graph and viewer.

Warm API requests produced five Output Cache hit logs per endpoint and zero database
commands. A ten-request concurrent cold Homepage probe produced only the single nine-command
read-model execution. API integration tests independently prove resource locking, warm reuse,
tag eviction, and that a failed response is not cached.

No Backend `Task.WhenAll`, `.Result`, `.Wait()`, or `GetAwaiter().GetResult()` usage exists in
the request path. The Homepage service intentionally keeps its scoped DbContext queries
sequential; concurrent Website calls are separate HTTP requests and therefore separate
scopes. The connection string uses Npgsql defaults (pooling enabled, maximum pool size 100),
and PostgreSQL showed no waiting session, so no pool or DbContext-concurrency change was made.

### After measurements

| Target | Debug + reduced logging + Next dev median / max | Release Backend + Next production median / max | Production payload |
| --- | ---: | ---: | ---: |
| `/api/public/homepage` | 5.7 / 7.2 ms | 1.1 / 1.2 ms | 6,379 B |
| `/api/public/events/upcoming` | 6.1 / 7.0 ms | 0.6 / 0.8 ms | 4,658 B |
| `/api/public/events/featured` | 3.4 / 4.2 ms | 0.5 / 0.7 ms | 2,510 B |
| `/api/public/events/previous` | 8.3 / 18.7 ms | 0.7 / 1.0 ms | 1,074 B |
| `/` | 5,702.3 / 7,881.1 ms | 25.8 / 38.6 ms | 133,077-133,120 B |
| `/events` | 2,127.3 / 4,293.3 ms | 21.2 / 28.8 ms | 101,772-101,815 B |

The final production-like cold observations were 347.5 ms for Homepage API, 30.0/16.2/15.7 ms for
upcoming/featured/previous, 147.2 ms for `/`, and 68.7 ms for `/events`. The post-change
Development-like cold Homepage API was 1,710.9 ms, down from the comparable reduced-logging
2,980.4 ms observation.

The remaining multi-second route latency is isolated to Next dev and host pressure rather
than SQL or Output Cache: the same cached Backend responses were 1-8 ms while Next dev routes
were still measured in seconds, but production Next served them in 19-30 ms warm. During the
initial diagnosis the 16 GB machine had about 1.5 GB free, the Website Next dev worker held
about 2 GB, and OneDrive/other interactive workloads were active. This is recorded as an
environmental scheduling factor, not presented as a blanket “localhost overhead” explanation.
