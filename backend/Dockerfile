# FROM node:19-alpine

# WORKDIR /app

# COPY . .

# # skips devDependencies with --omit=dev
# RUN npm ci

# RUN npm run build

# # to avoid running as root for security reasons
# USER node

# EXPOSE 3001

# CMD ["npm", "run", "start:prod"]

FROM node:18-alpine

WORKDIR /use/src/app

COPY . .

RUN npm ci --omit=dev

RUN npm install

RUN npm run build

USER node

CMD ["npm", "run", "start:prod"]