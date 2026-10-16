# TCF Canada — four-section continuous practice exam

Route: `/tcf/full-mock` (linked from the existing `/tcf` NCLC 7 overview).

- CO: 39 QCM / 35 minutes; each French speech-synthesis prompt may play once.
- CE: 39 QCM / 60 minutes.
- EE: three writing tasks / 60 minutes; draft text and all three task positions are saved.
- EO: three speaking prompts / 12 minutes. Microphone audio is recorded and retained **only on this browser** via existing IndexedDB audio storage; written notes and task positions sync across devices. Audio is deliberately not uploaded with the session or serialized as base64.
- Finishing a section automatically begins the next section. Each section has an absolute deadline, so reloads or closing the browser do not reset the clock. If the deadline elapsed while away, that section is submitted on return, and the next section begins only when the user returns.
- Existing QCM attempts, EE/EO attempts, and analytics are reused. EE/EO scores are **self-assessments**, not official TCF scores. Unrated EE/EO submissions retain drafts in the sitting but have `score:null` / `nclc:null` and are not written to the existing analytics attempts or trends. The completion page prompts for and supports explicit later ratings; even a deliberate zero must be selected for every rubric field. Manual section submission requires confirmation; timer expiry does not.

## Persistence

`GET /api/study-plan/tcf-full-mock` -> `{session,revision,serverNow}`.
`PUT /api/study-plan/tcf-full-mock` with `{session,revision}` -> `{ok:true,revision,session,serverNow}`; returns `409 FULL_MOCK_CONFLICT` for stale revisions.

The shared, bounded session schema is validated on both Node SQLite and D1 Workers. A new sitting creates a new session ID. The server maintains one latest sitting per authenticated learner/linked sync-key identity and uses compare-and-swap revisions to avoid silently overwriting work from a second device. The client stores every answer in localStorage immediately and serializes API writes. On GET or HTTP 409 it performs a per-question merge against the server state and (where known) the last acknowledged revision. Distinct question answers are preserved; when both devices change the same question, the server's answer wins. The client then retries automatically on the fetched revision. Client `updatedAt` is **never** used to authorize overwriting server answers. For concurrent EE/EO text edits of the same task the server is authoritative, unless the server value is unchanged from a known baseline. The client persists the last *server-acknowledged* session snapshot under a separate localStorage key; offline editing never changes that baseline. On reload after reconnect it performs a genuine three-way merge, retaining locally changed EE task text, EO notes and QCM answer edits when the server still matches the baseline. The server normalizes future-skewed timestamps while retaining existing stage deadlines. Every GET/PUT response includes a millisecond `serverNow`; the client estimates the server/device offset from request/response midpoint, persists it for offline operation, and uses the corrected clock for starting stages, displaying remaining time and deciding when to auto-submit. Validation errors (including HTTP 400) are surfaced distinctly from network outages. The device must be signed into the **same learning account** to see the same session.

Backend schema: Node's `ensureNodeFeatureSchema` creates `tcf_full_mock_sessions`, and D1 migration `0011_tcf_full_mock.sql` creates the same table and advances the Worker schema to v11. Deleting a learner's study data also deletes their sitting.

## Boundaries

The test harness covers bounded validation, deadline arithmetic, cross-learner isolation, revision conflicts, Node SQLite persistence, D1 restart persistence, four-section progression and cross-browser session restoration. Existing solo section pages and the roadmap are unchanged.

**Not an official TCF Canada examination.** The app uses its existing practice questions and browser speech synthesis; official test audio, secure proctoring and remote microphone-audio sync are not included.
