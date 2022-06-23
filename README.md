# Notifications Service

Elevate notification services can be setup in local using two methods:

A. Dockerized service with local dependencies(Intermediate): Refer **Section A**.
B. Local Service with local dependencies(Hardest): Refer **Section B**.

## A. Dockerized Service With Local Dependencies

**Expectation**: Run single docker containerized service with existing local (in host) or remote dependencies.

### Local Dependencies Steps

1. Update dependency (Kafka etc) IP addresses in .env with "**host.docker.internal**".

    Eg:

    ```
     #Kafka Host Server URL
     KAFKA_URL = host.docker.external:9092
    ```

2. Build the docker image.
    ```
    /ELEVATE/notification$ docker build -t elevate/notification:1.0 .
    ```
3. Run the docker container.

    - For Mac & Windows with docker v18.03+:

        ```
        $ docker run --name notification elevate/notification:1.0
        ```

    - For Linux:
        ```
        $ docker run --name notification --add-host=host.docker.internal:host-gateway elevate/notification:1.0`
        ```
        Refer [this](https://stackoverflow.com/a/24326540) for more information.

### Remote Dependencies Steps

1. Update dependency (Kafka etc) Ip addresses in .env with respective remote server IPs.

    Eg:

    ```
     #Kafka Host Server URL
     KAFKA_URL = 11.2.3.45:9092
    ```

2. Build the docker image.
    ```
    /ELEVATE/notification$ docker build -t elevate/notification:1.0 .
    ```
3. Run the docker container.

    ```
    $ docker run --name notification elevate/notification:1.0
    ```

## B. Local Service With Local Dependencies

**Expectation**: Run single service with existing local dependencies in host (**Non-Docker Implementation**).

### Steps

1. Install required tools & dependencies

    Install any IDE (eg: VScode)

    Install Nodejs: https://nodejs.org/en/download/

2. Clone the **Notification service** repository.

    ```
    git clone https://github.com/ELEVATE-Project/notification.git
    ```

3. Add **.env** file to the project directory

    Create a **.env** file in **src** directory of the project and copy these environment variables into it.

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

    ```

4. Install Npm packages

    ```
    ELEVATE/notification/src$ npm install
    ```

5. Start Notification server

    ```
    ELEVATE/notification/src$ npm start
    ```

## API Documentation link

https://dev.elevate-apis.shikshalokam.org/notification/api-doc

## Mentoring Services

https://github.com/ELEVATE-Project/mentoring.git

## User Services

https://github.com/ELEVATE-Project/user.git
