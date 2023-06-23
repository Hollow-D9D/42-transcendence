FROM node:lts-alpine

# WORKDIR /app

# COPY package.json yarn.lock ./

# RUN yarn install

# COPY . .

# RUN yarn run build

# RUN yarn global add serve

# # EXPOSE 3000

# CMD ["serve", "-s", "build", "-l", "3000"]

RUN apk add --no-cache bash

WORKDIR /app

ENTRYPOINT [ "bash", "start.sh" ]
