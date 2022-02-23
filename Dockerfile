FROM node:16-alpine
ARG NPM_TOKEN
WORKDIR /run
COPY package*.json tsconfig.json ./
COPY src /run/src
RUN npm install
CMD [ "npm", "start" ]