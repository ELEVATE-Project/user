# Notifications Service APIs

## Setup Notification Service without docker

Recommend to,

Install any IDE in your system(eg: VScode etc..)

Install NodeJs from: https://nodejs.org/en/download/

Install kafka from: https://kafka.apache.org/downloads

### 1. Cloning the Notifications repository into your system

Go to https://github.com/ELEVATE-Project/Notification From the code tab copy the link. Using that link clone the repository into your local machine.

Let's make it easier for you:

    1. Create a new folder where you want to clone the repository.
    2. Goto that directory through the terminal and execute the commands.

git clone https://github.com/ELEVATE-Project/Notification.git

### 2. Add the .env file to the project directory

    create a file named .env in the root directory of the project and copy the below code into that file.
    Add the following environment configs

### 3. Start Kafka

    start kafka
    create the kafka topic and use the same in .env

### Required Environment variables:

```
# Notification Service Config

#Port on which service runs
APPLICATION_PORT = 3000

#Application environment
APPLICATION_ENV = development

#Route after base url
APPLICATION_BASE_URL = /notification/

#Kafka endpoint
KAFKA_HOST = "localhost:9092"

#kafka topic name
KAFKA_TOPIC ="testTopic"

#kafka consumer group id
KAFKA_GROUP_ID = "notification"

#sendgrid api key
SENDGRID_API_KEY = "SG.sdssd.dsdsd.XVSDGFEBGEB.sddsd"

#sendgrid sender email address
SENDGRID_FROM_MAIL = "test@gmail.com"

# Api doc url
API_DOC_URL = '/api-doc'

```

### 3. Install Npm

    npm i
    To install the dependencies in your local machine.

### 4. To Run server

    npm start

## Setup Notification Service using Docker

Recommend to,

Install any IDE in your system(eg: VScode etc..)

Install Docker Engine from: https://docs.docker.com/engine/install/

Install Docker Compose from: https://docs.docker.com/compose/install/

### 1. Cloning the Notifications repository into your system

Go to https://github.com/ELEVATE-Project/Notification From the code tab copy the link. Using that link clone the repository into your local machine.

Let's make it easier for you:

    1. Create a new folder where you want to clone the repository.
    2. Goto that directory through the terminal and execute the commands.

git clone https://github.com/ELEVATE-Project/Notification.git

### 2. Add the .env file to the project directory

    create a file named .env in the root directory of the project and copy the below code into that file.
    Add the following environment configs

### 3. Required Environment variables:

```
# Notification Service Config

#Port on which service runs
APPLICATION_PORT = 3000

#Application environment
APPLICATION_ENV = development

#Route after base url
APPLICATION_BASE_URL = /notification/

#Kafka endpoint
KAFKA_HOST = "localhost:9092"

#kafka topic name
KAFKA_TOPIC ="testTopic"

#kafka consumer group id
KAFKA_GROUP_ID = "notification"

#sendgrid api key
SENDGRID_API_KEY = "SG.sdssd.dsdsd.XVSDGFEBGEB.sddsd"

#sendgrid sender email address
SENDGRID_FROM_MAIL = "test@gmail.com"

# Api doc url
API_DOC_URL = '/api-doc'

```

### 4. To Run Server

    docker-compose up

## API Documentation link

https://dev.elevate-apis.shikshalokam.org/notification/api-doc
