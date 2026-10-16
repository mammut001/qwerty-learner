FROM node:24-alpine
WORKDIR /app
# Explicit runtime-module allowlist. Keep test files out of the production image.
# All imports of study-plan.mjs (and their dependencies) must be present here.
COPY server/echelle-ai-calibration.mjs server/echelle-ai-harness.mjs server/echelle-ai-providers.mjs server/echelle-curriculum-core.mjs server/echelle-curriculum.mjs \
  server/echelle-data.mjs server/echelle-grammar-bank.mjs server/echelle-lexique-bank.mjs server/echelle-listening-bank.mjs server/echelle-memory.mjs \
  server/echelle-production-bank.mjs server/echelle-reading-bank.mjs server/echelle-texte-bank.mjs server/placement-data.mjs server/real-reading.mjs \
  server/recall-moderation-calibration.mjs server/recall-moderation-harness.mjs server/speech-asr.mjs server/sqlite-backup.mjs server/study-admin.mjs \
  server/study-apple.mjs server/study-billing.mjs server/study-cohorts.mjs server/study-csv.mjs server/study-features.mjs \
  server/study-firebase.mjs server/study-full-mock.mjs server/study-http.mjs server/study-model.mjs server/study-node-features.mjs server/study-node-passkey.mjs \
  server/study-observability.mjs server/study-passkey.mjs server/study-plan.mjs server/study-recalls.mjs server/study-reports.mjs \
  server/youdao-fr.mjs ./server/
COPY server/echelle-variants/ ./server/echelle-variants/
RUN mkdir /data && chown node:node /data
USER node
EXPOSE 8787
CMD ["node", "server/study-plan.mjs"]
