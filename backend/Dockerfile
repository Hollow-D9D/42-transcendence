FROM node:19-alpine

WORKDIR /use/src/app

COPY . .

RUN npm ci --omit=dev

RUN npm install

RUN npm run build

USER node

CMD ["npm", "run", "start:prod"]