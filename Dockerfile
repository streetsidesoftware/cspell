FROM node:16.16.0

WORKDIR /repo
COPY . .
RUN npm install
RUN npm run build

ENV NODE_ENV=production
WORKDIR /workdir
ENTRYPOINT [ "node", "/repo/bin.js" ]
