FROM node:16-alpine
WORKDIR /node-docker


COPY . .
RUN npm install

EXPOSE 3000

CMD [ "npm","start" ]
