FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install
# If you are building your code for production
# RUN npm ci --only=production
RUN npm install -g nodemon

RUN apt-get update && apt-get install -y \
	graphicsmagick \
	&& apt-get clean

# Bundle app source
COPY . .

EXPOSE 80

CMD [ "node", "app.js" ]