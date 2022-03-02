FROM node:12

WORKDIR /opt/notification

#copy package.json file
COPY package.json /opt/notification

#install node packges
RUN npm install

#copy all files 
COPY . /opt/notification

#expose the application port
EXPOSE 3000

#start the application
CMD node app.js