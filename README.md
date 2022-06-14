# Mentoring Service

## Setup Options

Elevate services can be setup in local using three methods:

1. Docker-Compose File (Easiest): Refer **Section A**.
2. Dockerized service with local dependencies(Intermediate): Refer **Section B**.
3. Local Service with local dependencies(Hardest): Refer **Section C**.

## A. Docker-Compose

**Expectation**: Run all services at the same time with a common **Docker-Compose** file.

### Steps

1.  Install **Docker** & **Docker-Compose**.
2.  Clone all elevate services into a common directory.
    ```
    ./ELEVATE/
    ├── mentoring
    ├── notification
    ├── scheduler
    └── user
    ```
3.  To create/start all containers:

    ```
    ELEVATE/mentoring$ docker-compose up
    ```

4.  To remove all containers & networks:

    ```
    ELEVATE/mentoring$ docker-compose down
    ```

    Refer **Docker-Compose README** for more information.

    **Note:** It isn't always necessary to run **down** command. Existing containers and networks can be stopped gracefully by using **Ctrl + C** key combination.

    **Warning:** Do not use docker-compose in production.

## B. Dockerized Service With Local Dependencies

**Expectation**: Run single docker containerized service with existing local dependencies in host.

### Steps

1. Placeholder step 1
2. Placeholder step 2
3. Placeholder step 3

## C. Local Service With Local Dependencies

**Expectation**: Run single service with existing local dependencies in host (**Non-Docker Implementation**).

### Steps

1. Install required tools & dependencies

    Install any IDE (eg: VScode)

    Install Nodejs: https://nodejs.org/en/download/

    Install MongoDB: https://docs.mongodb.com/manual/installation/

    Install Robo-3T: ​​ https://robomongo.org/

2. Clone the **Mentoring service** repository.

    ```
    git clone https://github.com/ELEVATE-Project/mentoring.git
    ```

3. Add **.env** file to the project directory

    Create a **.env** file in **src** directory of the project and copy these environment variables into it.

    ```
    # Mentoring Service Config

    # Port on which service runs
    APPLICATION_PORT = 3000

    # Service environment
    APPLICATION_ENV = development

    # Route after base url
    APPLICATION_BASE_URL = /mentoring/

    # Mongo db connectivity url
    MONGODB_URL = mongodb://localhost:27017/elevate-mentoring

    # Token secret to verify the access token
    ACCESS_TOKEN_SECRET = 'bsj82AHBxahusub12yexlashsbxAXADHBlaj'

    # Kafka hosted server url
    KAFKA_URL = localhost:9092

    # Kafka group to which consumer belongs
    KAFKA_GROUP_ID = userservice

    # Kafka topic to push notification data
    NOTIFICATION_KAFKA_TOPIC = notificationtopic

    # Kafka topic name to consume from mentoring topic
    KAFKA_MENTORING_TOPIC ="mentoringtopic"

    # Kafka topic to push recording data
    KAFKA_RECORDING_TOPIC ="recordingtopic"

    # Any one of three features available for cloud storage
    CLOUD_STORAGE = 'GCP/AWS/AZURE'

    # Gcp json config file path
    GCP_PATH = 'gcp.json'

    # Gcp bucket name which stores files
    DEFAULT_GCP_BUCKET_NAME = 'gcp-bucket-storage-name'

    # Gcp project id
    GCP_PROJECT_ID = 'project-id'

    # Aws access key id
    AWS_ACCESS_KEY_ID = 'aws-access-key-id'

    # Aws secret access key
    AWS_SECRET_ACCESS_KEY = 'aws-secret-access-key'

    # Aws region where bucket will be located
    AWS_BUCKET_REGION = 'ap-south-1'

    # Aws end point
    AWS_BUCKET_ENDPOINT = 's3.ap-south-1.amazonaws.com'

    # Aws bucket name which stores files
    DEFAULT_AWS_BUCKET_NAME = 'aws-bucket-storage-name'

    # Azure storage account name
    AZURE_ACCOUNT_NAME = 'account-name'

    # Azure storage account key
    AZURE_ACCOUNT_KEY = 'azure-account-key'

    # Azure storage container which stores files
    DEFAULT_AZURE_CONTAINER_NAME = 'azure-container-storage-name'

    # user serice host
    USER_SERIVCE_HOST = 'http://localhost:3001'

    # user serice base url
    USER_SERIVCE_BASE_URL = '/user/'

    # Big blue button url
    BIG_BLUE_BUTTON_URL = https://dev.mentoring.shikshalokam.org

    # Big blue button base url
    BIB_BLUE_BUTTON_BASE_URL = /bigbluebutton/

    # Meeting end callback events end point
    MEETING_END_CALLBACK_EVENTS = https%3A%2F%2Fdev.elevate-apis.shikshalokam.org%2Fmentoring%2Fv1%2Fsessions%2Fcompleted

    # Big blue button secret key
    BIG_BLUE_BUTTON_SECRET_KEY = n

    # Big blue button recording ready callback url
    RECORDING_READY_CALLBACK_URL = http%3A%2F%2Flocalhost%3A3000%2F%3FmeetingID%3Dmeet123

    # Enable logging of network request
    ENABLE_LOG = true
    ```

4. Start MongoDB locally

    Based on your host operating system and method used, start MongoDB.

5. Install Npm packages

    ```
    ELEVATE/mentoring/src$ npm install
    ```

6. Start Mentoring server

    ```
    ELEVATE/mentoring/src$ npm start
    ```

7. To set scheduler service job

    Run the **schedulerScript** file from scripts directory:

    ```
    ELEVATE/mentoring/src/scripts$ node schedulerScript.js
    ```
