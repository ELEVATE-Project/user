FROM node:16

#Set working directory
<<<<<<< HEAD
WORKDIR /data/user
=======
WORKDIR /var/src/
>>>>>>> master

#Copy package.json file
COPY ./src/package.json .

#Install node packages
RUN npm install && npm install -g nodemon@2.0.16

#Copy all files 
COPY ./src .

#Expose the application port
EXPOSE 3001

#Start the application
CMD [ "node", "app.js" ]