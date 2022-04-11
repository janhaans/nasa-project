FROM  node:16-alpine

WORKDIR /app

COPY  package*.json ./

COPY client/package*.json client/
RUN npm install --prefix client --production

COPY server/package*.json server/
RUN npm install --prefix server --production

COPY client/ client/
RUN npm run build --prefix client

COPY server/ server/

USER node

CMD ["npm", "run", "start", "--prefix", "server"]

EXPOSE 8000