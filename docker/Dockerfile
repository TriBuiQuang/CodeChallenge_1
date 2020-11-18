FROM node:15.2.1-alpine

WORKDIR /app

COPY . .

RUN apk --no-cache add --virtual builds-deps build-base python
RUN npm install

EXPOSE 3000

CMD ["npm", "start"]
