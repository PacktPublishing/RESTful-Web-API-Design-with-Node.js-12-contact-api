FROM node:12

WORKDIR /app

COPY ./package*.json ./
RUN npm ci --production

COPY ./ ./

CMD [ "npm", "run", "start:prod" ]