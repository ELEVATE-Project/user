<div align="center">

# Mentoring Service

<a href="https://shikshalokam.org/elevate/">
<img
    src="https://shikshalokam.org/wp-content/uploads/2021/06/elevate-logo.png"
    height="140"
    width="300"
  />
</a>

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/ELEVATE-Project/mentoring/tree/master.svg?style=shield)](https://dl.circleci.com/status-badge/redirect/gh/ELEVATE-Project/mentoring/tree/master)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=ELEVATE-Project_mentoring&metric=duplicated_lines_density&branch=master)](https://sonarcloud.io/summary/new_code?id=ELEVATE-Project_mentoring)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=ELEVATE-Project_mentoring&metric=coverage)](https://sonarcloud.io/summary/new_code?id=ELEVATE-Project_mentoring)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=ELEVATE-Project_mentoring&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=ELEVATE-Project_mentoring)
[![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io)
[![Docs](https://img.shields.io/badge/Docs-success-informational)](https://elevate-docs.shikshalokam.org/mentorEd/intro)

![GitHub package.json version (subfolder of monorepo)](https://img.shields.io/github/package-json/v/ELEVATE-Project/mentoring?filename=src%2Fpackage.json)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

<details><summary>CircleCI insights</summary>

[![CircleCI](https://dl.circleci.com/insights-snapshot/gh/ELEVATE-Project/mentoring/master/buil-and-test/badge.svg?window=30d)](https://app.circleci.com/insights/github/ELEVATE-Project/mentoring/workflows/buil-and-test/overview?branch=integration-testing&reporting-window=last-30-days&insights-snapshot=true)

</details>

<details><summary>develop</summary>

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/ELEVATE-Project/mentoring/tree/develop.svg?style=shield)](https://dl.circleci.com/status-badge/redirect/gh/ELEVATE-Project/mentoring/tree/develop)
![GitHub package.json version (subfolder of monorepo)](https://img.shields.io/github/package-json/v/ELEVATE-Project/mentoring/develop?filename=src%2Fpackage.json)

[![CircleCI](https://dl.circleci.com/insights-snapshot/gh/ELEVATE-Project/mentoring/dev/buil-and-test/badge.svg?window=30d)](https://app.circleci.com/insights/github/ELEVATE-Project/mentoring/workflows/buil-and-test/overview?branch=develop&reporting-window=last-30-days&insights-snapshot=true)

[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=ELEVATE-Project_mentoring&metric=duplicated_lines_density&branch=develop)](https://sonarcloud.io/summary/new_code?id=ELEVATE-Project_mentoring)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=ELEVATE-Project_mentoring&metric=coverage&branch=develop)](https://sonarcloud.io/summary/new_code?id=ELEVATE-Project_mentoring)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=ELEVATE-Project_mentoring&metric=vulnerabilities&branch=develop)](https://sonarcloud.io/summary/new_code?id=ELEVATE-Project_mentoring)

</details>

</br>
The Mentoring building block enables effective mentoring interactions between mentors and mentees. The capability aims to create a transparent eco-system to learn, connect, solve, and share within communities.MentorED is an open source mentoring application that facilitates peer learning and professional development by creating a community of mentors and mentees.

</div>
<!-- [![CircleCI](https://dl.circleci.com/status-badge/img/gh/ELEVATE-Project/mentoring/tree/dev.svg?style=shield)](https://dl.circleci.com/status-badge/redirect/gh/ELEVATE-Project/mentoring/tree/dev)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=ELEVATE-Project_mentoring&metric=duplicated_lines_density&branch=master)](https://sonarcloud.io/summary/new_code?id=ELEVATE-Project_mentoring)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=ELEVATE-Project_mentoring&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=ELEVATE-Project_mentoring)
<a href="https://shikshalokam.org/elevate/">
<img
    src="https://shikshalokam.org/wp-content/uploads/2021/06/elevate-logo.png"
    height="140"
    width="300"
   align="right"
  />
</a>
(Dev)
 -->

# Setup Options

Elevate services can be setup in local using three methods:

<details><summary>Docker-Compose File (Easiest)</summary>

## A. Docker-Compose

**Expectation**: Run all services simultaneously with a common **Docker-Compose** file.

### Steps

1.  Install **Docker** & **Docker-Compose**.

2.  To create/start all containers:

    ```
    ELEVATE/mentoring$ docker-compose up
    ```

    You can pass .env file to docker images of elevate service by using the below command

    ```
    ELEVATE/mentoring$ mentoring_env=".env path" users_env=".env path" notification_env=".env path" scheduler=".env path"  docker-compose up

    ```

    example :

    ```
    ELEVATE/mentoring$ mentoring_env="/Users/mentoring/src/.env" users_env="/Users/user/src/.env" notification_env="/Users/notification/src/.env" scheduler="/Users/scheduler/src/.env"  docker-compose up

    ```

3.  To remove all containers & networks:

            ```
            ELEVATE/mentoring$ docker-compose down
            ```

            Refer **Docker-Compose README** for more information.

            **Note:** It isn't always necessary to run **down** command. Existing containers and networks can be stopped gracefully by using **Ctrl + C** key combination.

            **Warning:** Do not use docker-compose in production.

</details>

<details><summary>Dockerized service with local dependencies(Intermediate)</summary>

## B. Dockerized Service With Local Dependencies

**Expectation**: Run single docker containerized service with existing local (in host) or remote dependencies.

### Local Dependencies Steps

1. Update dependency (Mongo v4.1.4, Kafka etc) IP addresses in .env with "**host.docker.internal**".

    Eg:

    ```
     #MongoDb Connectivity Url
     MONGODB_URL = mongodb://host.docker.internal:27017/elevate-mentoring

     #Kafka Host Server URL
     KAFKA_URL = host.docker.external:9092
    ```

2. Find **host.docker.internal** IP address and added it to **mongod.conf** file in host.

    Eg: If **host.docker.internal** is **172.17.0.1**,
    **mongod.conf:**

    ```
    # network interfaces
    net:
        port: 27017
        bindIp: "127.0.0.1,172.17.0.1"
    ```

    Note: Steps to find **host.docker.internal** IP address & location of **mongod.conf** is operating system specific. Refer [this](https://stackoverflow.com/questions/22944631/how-to-get-the-ip-address-of-the-docker-host-from-inside-a-docker-container) for more information.

3. Build the docker image.
    ```
    /ELEVATE/mentoring$ docker build -t elevate/mentoring:1.0 .
    ```
4. Run the docker container.

    - For Mac & Windows with docker v18.03+:

        ```
        $ docker run --name mentoring elevate/mentoring:1.0
        ```

    - For Linux:
        ```
        $ docker run --name mentoring --add-host=host.docker.internal:host-gateway elevate/mentoring:1.0`
        ```
        Refer [this](https://stackoverflow.com/a/24326540) for more information.

### Remote Dependencies Steps

1.  Update dependency (Mongo v4.1.4, Kafka etc) Ip addresses in .env with respective remote server IPs.

    Eg:

    ```
     #MongoDb Connectivity Url
     MONGODB_URL = mongodb://10.1.2.34:27017/elevate-mentoring

     #Kafka Host Server URL
     KAFKA_URL = 11.2.3.45:9092
    ```

2.  Add Bind IP to **mongod.conf** in host:

    Follow the instructions given [here.](https://www.digitalocean.com/community/tutorials/how-to-configure-remote-access-for-mongodb-on-ubuntu-20-04)

    Note: Instructions might differ based on MongoDB version and operating system.

3.  Build the docker image.
    ```
    /ELEVATE/mentoring$ docker build -t elevate/mentoring:1.0 .
    ```
4.  Run the docker container.

        ```
        $ docker run --name mentoring elevate/mentoring:1.0
        ```

</details>

<details><summary>Local Service with local dependencies(Hardest)</summary>

## C. Local Service With Local Dependencies

**Expectation**: Run a single service with existing local dependencies in the host (**Non-Docker Implementation**).

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

    Run the **schedulerScript** file from the scripts directory:

    ```
    ELEVATE/mentoring/src/scripts$ node schedulerScript.js
    ```

</details>

</br>

# Tech stack

-   Node - 16.0.0
-   Kafka - 3.1.0
-   Jest - 28.1.1
-   MongoDB - 4.1.4
-   Redis - 7.0.0

```
Uses MongoDB v4.1.4, which has an OSI Compliant License (GNU Affero General Public License, version 3)
MongoDB v4.1.4 repository: https://github.com/mongodb/mongo/tree/r4.1.4
MongoDB v4.1.4 License: https://github.com/mongodb/mongo/blob/r4.1.4/LICENSE-Community.txt
```

# Scripts

## Scheduler

To run the scheduler scripts

```bash
cd src/scripts
```

```bash
node schedulerScript.js
```

We have a dedicated [scheduler](https://github.com/ELEVATE-Project/scheduler) service running.

# Migrations Commands

### Check migrations

```bash
npm run elevate-migrations s
```

### Create migrations

```bash
npm run elevate-migrations create categoryEntity #Where categoryEntity is the file name.
```

<details><summary>20220726145008-categoryEntity.js</summary>

We have followed the following structure for migration files to reduce code duplication.

```js
let categories = [
	{
		value: 'sqaa',
		label: 'SQAA',
		image: 'entity/SQAA.jpg',
	},
	{
		value: 'communication',
		label: 'Communication',
		image: 'entity/Communication.png',
	},
    ...
]
var moment = require('moment')

module.exports = {
	async up(db) {
		global.migrationMsg = 'Uploaded categories entity'
		let entityData = []
		categories.forEach(async function (category) {
			category['status'] = 'ACTIVE'
			category['deleted'] = false
			category['type'] = 'categories'
			category['updatedAt'] = moment().format()
			category['createdAt'] = moment().format()
			category['createdBy'] = 'SYSTEM'
			category['updatedBy'] = 'SYSTEM'
			entityData.push(category)
		})
		await db.collection('entities').insertMany(entityData)
	},

	async down(db) {
		db.collection('entities').deleteMany({
			value: { $in: categories.map((category) => category.value) },
		})
	},
}
```

</details>

### Run migrations

```bash
npm run elevate-migrations up
```

### Down migrations

```bash
npm run elevate-migrations down
```

To know more about migrations refer project [Wiki](https://github.com/ELEVATE-Project/mentoring/wiki/Migration)

# Run tests

## Integration tests

```
npm run test:integration
```

To know more about integration tests and their implementation refer to the project [Wiki](https://github.com/ELEVATE-Project/user/wiki/Integration-and-Unit-testing).

## Unit tests

```
npm test
```

# Dependencies

This project is depended on a [user](https://github.com/ELEVATE-Project/user) , [notification](https://github.com/ELEVATE-Project/notification) and [scheduler](https://github.com/ELEVATE-Project/scheduler) service.
Set up these services using the setup guide.
You're free to use any micro-service that is optimal for the use case.
You can learn more about the full implementation of MentorEd [here](https://elevate-docs.shikshalokam.org/.mentorEd/intro) .
The frontend/mobile application [repo](https://github.com/ELEVATE-Project/mentoring-mobile-app).

# Team

<a href="https://github.com/ELEVATE-Project/mentoring/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ELEVATE-Project/mentoring" />
</a>

# Open Source Dependencies

Several open source dependencies that have aided Mentoring's development:

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-000?style=for-the-badge&logo=apachekafka)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)
![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)

<!-- ![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)
![CircleCI](https://img.shields.io/badge/circle%20ci-%23161616.svg?style=for-the-badge&logo=circleci&logoColor=white) -->
