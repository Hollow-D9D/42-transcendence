FROM node:19-alpine

WORKDIR /user/src/app

COPY . .

# skips devDependencies with --omit=dev
RUN npm ci

RUN npm run build

# to avoid running as root for security reasons
USER node

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
