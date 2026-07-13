# Media workflow

The database stores media metadata and external URLs only. Binary images and videos must never be stored in PostgreSQL, application source, or Git. Cloudinary stores approved external binaries through an Application abstraction implemented in Infrastructure.

## Upload flow

An authorized media manager submits one multipart file. The API validates the request, Application validates empty/size/MIME/extension rules and sanitizes the filename, Infrastructure streams to Cloudinary, and metadata is saved in PostgreSQL. If persistence fails after upload, the service attempts a compensating Cloudinary deletion. Secrets and raw content are never logged.

The admin UI accepts several files into a local queue but uploads them one at a time after an explicit action. Each item reports waiting, uploading, success, or failure independently; a failed item does not discard the rest of the queue. Client checks provide early feedback, while backend validation remains authoritative. Metadata and an optional event usage, order, and featured state are applied per uploaded asset.

Images default to JPEG, PNG, and WebP with a 15 MB limit. Videos default to MP4 and WebM with a 100 MB limit. QuickTime is allowed only when explicitly configured. Malware scanning remains a required future step.

Media begins as Draft or the explicitly supplied state, becomes publicly usable only when Approved, and can be removed from public projections by setting Hidden. Delete requests currently hide metadata; they do not hard-delete reusable Cloudinary assets.

`EventMedia` assigns an asset to Hero, Cover, Gallery, HomepagePreview, or another approved usage with ordering and featured state. Removing an assignment does not remove the asset. Public event/gallery projections include only Published events and Approved media.

A future bulk importer must use controlled concurrency, resumable/background processing, per-item validation, and audit reporting. The full production archive must never be committed to this repository.

## Local verification

Use disposable development assets only. Enable the backend Cloudinary integration with development credentials, sign in as a role covered by `MediaManagerOrAbove`, upload a small supported image or video as Draft, and verify list filtering, details, metadata editing, approval/hide, and event assignment. Confirm the browser receives only delivery URLs and metadata; API credentials must remain in the backend process environment.
