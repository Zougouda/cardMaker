FROM node

ADD . /app/
WORKDIR /app

RUN npm install
RUN mkdir -p /data/cards

EXPOSE 4242

CMD node server.js