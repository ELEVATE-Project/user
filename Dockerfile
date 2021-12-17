FROM node:12

WORKDIR /opt/user

#copy package.json file
COPY package.json /opt/user

#install node packges
RUN npm install

#copy all files 
COPY . /opt/user

#expose the application port
EXPOSE 3000

#start the application
CMD node app.js