FROM node:24-alpine
WORKDIR /app
COPY server/*.mjs ./server/
COPY server/echelle-variants/ ./server/echelle-variants/
RUN mkdir /data && chown node:node /data
USER node
EXPOSE 8787
CMD ["node", "server/study-plan.mjs"]
