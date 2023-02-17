FROM node:14

WORKDIR /usr/src/app

COPY . .
RUN yarn
RUN yarn build

EXPOSE 80

ENTRYPOINT [ "yarn", "start:prod" ]