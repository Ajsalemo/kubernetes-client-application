FROM node:22.13.0-alpine3.20 AS build

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install && npm i pm2 -g

COPY . /usr/src/app
RUN npm run build

FROM build AS production
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/build .
COPY --from=build /usr/src/app/entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 8080

ENTRYPOINT [ "/usr/src/app/entrypoint.sh" ] 