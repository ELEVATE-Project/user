FROM node:12

WORKDIR /opt/mentoring

#copy package.json file
COPY package.json /opt/mentoring

#install node packges
RUN npm install

#copy all files 
COPY . /opt/mentoring

#expose the application port
EXPOSE 3000

#start the application
CMD node app.js