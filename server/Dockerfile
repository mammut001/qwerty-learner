FROM node:24-alpine
WORKDIR /app
COPY server/study-plan.mjs ./server/study-plan.mjs
RUN mkdir /data && chown node:node /data
USER node
EXPOSE 8787
CMD ["node", "server/study-plan.mjs"]
