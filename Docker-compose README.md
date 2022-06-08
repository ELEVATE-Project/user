# Docker-Compose README

This document specifies how **docker-compose.yml** file should be written and setup for all Elevate micro-services.

## Specifications

1.  Location: **_Root directory of the mentoring service_**.
2.  File name: **_docker-compose.yml_**

<br>

## Docker Compose Commands

To create/start all containers:

    ELEVATE/mentoring$ docker-compose up

To remove all containers & networks:

    ELEVATE/mentoring$ docker-compose down

**Note:** It isn't always necessary to run **down** command. Existing containers and networks can be stopped gracefully by using **Ctrl + C** key combination.

**Warning:** Do not use docker-compose in production.

<br>

## Expected Micro-services Directory Structure

Every micro-service directory should be placed in the same root directory as that of **mentoring service** and mentoring service's root directory holds the **docker-compose.yml** file.

This directory structure ensures proper relative paths from docker-compose file to appropriate micro-services.

Each micro-service which should be part of docker-compose must have a Dockerfile in its root directory.

    ./ELEVATE/
    ├── documents
    │   ├── .git
    │   ├── .gitignore
    │   ├── README.md
    │   └── src
    ├── mentoring
    │   ├── .circleci
    │   ├── docker-compose.yml		<----
    │   ├── Dockerfile
    │   ├── Dockerfile README.md
    │   ├── .dockerignore
    │   ├── .git
    │   ├── .gitignore
    │   ├── .prettierrc.json
    │   └── src
    ├── notification
    │   ├── .circleci
    │   ├── Dockerfile
    │   ├── .dockerignore
    │   ├── .git
    │   ├── .gitignore
    │   ├── .prettierrc.json
    │   ├── README.md
    │   └── src
    ├── scheduler
    │   ├── app.js
    │   ├── config.js
    │   ├── configs
    │   ├── controllers
    │   ├── .DS_Store
    │   ├── .env
    │   ├── generics
    │   ├── .git
    │   ├── models
    │   ├── node_modules
    │   ├── package.json
    │   ├── package-lock.json
    │   ├── README.md
    │   ├── route
    │   ├── services
    │   └── validator
    └── user
        ├── .circleci
        ├── Dockerfile
        ├── .dockerignore
        ├── .git
        ├── .gitignore
        ├── .prettierrc.json
        ├── README.md
        └── src

<br>

## Sample docker-compose.yml File

    version: '3'
    services:
    zookeeper:
        image: 'bitnami/zookeeper:3.8.0'
        ports:
        - '2181:2181'
        environment:
        - ALLOW_ANONYMOUS_LOGIN=yes
        networks:
        - elevate_net
        volumes:
        - zookeeper-data:/bitnami/zookeeper
        logging:
        driver: none
    kafka:
        image: 'bitnami/kafka:3.1.0'
        ports:
        - '9092:9092'
        environment:
        - KAFKA_BROKER_ID=1
        - KAFKA_CFG_LISTENERS=CLIENT://:9092,EXTERNAL://:9093
        - KAFKA_CFG_ADVERTISED_LISTENERS=CLIENT://kafka:9092,EXTERNAL://localhost:9093
        - KAFKA_CFG_ZOOKEEPER_CONNECT=zookeeper:2181
        - ALLOW_PLAINTEXT_LISTENER=yes
        - KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP=CLIENT:PLAINTEXT,EXTERNAL:PLAINTEXT
        - KAFKA_CFG_INTER_BROKER_LISTENER_NAME=CLIENT
        depends_on:
        - zookeeper
        networks:
        - elevate_net
        volumes:
        - kafka-data:/bitnami/kafka
        logging:
        driver: none
    mongo:
        image: 'mongo:4.4.14'
        restart: 'always'
        ports:
        - '27017:27017'
        networks:
        - elevate_net
        volumes:
        - mongo-data:/data/db
        logging:
        driver: none
    redis:
        image: 'redis:7.0.0'
        restart: 'always'
        expose:
        - '6379'
        networks:
        - elevate_net
        logging:
        driver: none
    mentoring:
        build: './'
        image: elevate/mentoring:1.0
        volumes:
        - ./src/:/var/src
        ports:
        - '3000:3000'
        command: ['nodemon', 'app.js']
        environment:
        - MONGODB_URL=mongodb://mongo:27017/elevate-mentoring
        - KAFKA_URL=kafka:9092
        - USER_SERIVCE_HOST=http://user:3001
        depends_on:
        - kafka
        - mongo
        networks:
        - elevate_net
    user:
        build: '../user/'
        image: elevate/user:1.0
        volumes:
        - ../user/src/:/var/src
        ports:
        - '3001:3001'
        command: ['nodemon', 'app.js']
        environment:
        - MONGODB_URL=mongodb://mongo:27017/elevate-mentoring
        - KAFKA_URL=kafka:9092
        - REDIS_HOST=redis://redis:6379
        depends_on:
        - kafka
        - mongo
        - redis
        networks:
        - elevate_net
    notification:
        build: '../notification/'
        image: elevate/notification:1.0
        volumes:
        - ../notification/src/:/var/src
        ports:
        - '3002:3002'
        command: ['nodemon', 'app.js']
        environment:
        - KAFKA_HOST=kafka:9092
        depends_on:
        - kafka
        - mongo
        networks:
        - elevate_net
    networks:
    elevate_net:
        external: false
    volumes:
    zookeeper-data:
    kafka-data:
    mongo-data:

<br>

## References:

1. Bitnami/Zookeeper: https://hub.docker.com/r/bitnami/zookeeper
2. Bitnami/kafka: https://hub.docker.com/r/bitnami/kafka
3. Official Mongo: https://hub.docker.com/_/mongo
4. Official Redis: https://hub.docker.com/_/redis

<br>

## Additional Resources

1. Docker Compose Documentation: https://docs.docker.com/compose/
2. Dockerfile Documentation: https://docs.docker.com/engine/reference/builder/
