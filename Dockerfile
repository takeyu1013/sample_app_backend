FROM node:lts
COPY . /app
WORKDIR /app
RUN yarn
EXPOSE 3001
CMD [ "yarn", "dev" ]
