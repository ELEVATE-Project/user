# Dockerfile README

This document specifies how **Dockerfile** should be written and setup for all Elevate micro-services.

## Specifications

1.  Location: **_Root directory of the service._**
2.  File name: **_Dockerfile_**

<br>

## Expected Root Directory Structure

    ./notification/
    ├── .circleci
    ├── Dockerfile      <----
    ├── .dockerignore
    ├── .git
    ├── .gitignore
    ├── .prettierrc.json
    ├── README.md
    └── src

<br>

## Sample Dockerfile

    #Specify the base image
    FROM node:16

    #Set working directory
    WORKDIR /var/src/

    #Copy package.json file to working directory
    COPY ./src/package.json .

    #Install node modules & install nodemon globally
    RUN npm install && npm install -g nodemon@2.0.16

    #Copy contents of src folder to working directory
    COPY ./src .

    #Expose relevant application port
    EXPOSE 3000

    #Start the application
    CMD [ "node", "app.js" ]

<br>

## Additional Resources

1. Dockerfile Documentation: https://docs.docker.com/engine/reference/builder/
2. Dockerize A Node.js Web App: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
3. Build your Node image: https://docs.docker.com/language/nodejs/build-images/
