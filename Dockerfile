FROM node:carbon-slim

WORKDIR /usr/app

COPY package.json .
RUN npm install --quiet

COPY . .
