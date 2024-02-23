<div align="center">

# User Service

<a href="https://shikshalokam.org/elevate/">
<img
    src="https://shikshalokam.org/wp-content/uploads/2021/06/elevate-logo.png"
    height="140"
    width="300"
  />
</a>

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/ELEVATE-Project/user/tree/master.svg?style=shield)](https://dl.circleci.com/status-badge/redirect/gh/ELEVATE-Project/user/tree/master)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=ELEVATE-Project_user&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=ELEVATE-Project_user)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=ELEVATE-Project_user&metric=coverage)](https://sonarcloud.io/summary/new_code?id=ELEVATE-Project_user)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=ELEVATE-Project_user&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=ELEVATE-Project_user)
[![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io)
[![Docs](https://img.shields.io/badge/Docs-success-informational)](https://elevate-docs.shikshalokam.org/mentorEd/intro)
[![Docs](https://img.shields.io/badge/API-docs-informational)](https://dev.elevate-apis.shikshalokam.org/user/api-doc)

![GitHub package.json version (subfolder of monorepo)](https://img.shields.io/github/package-json/v/ELEVATE-Project/user?filename=src%2Fpackage.json)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

<details><summary>CircleCI insights</summary>

[![CircleCI](https://dl.circleci.com/insights-snapshot/gh/ELEVATE-Project/user/master/buil-and-test/badge.svg?window=30d)](https://app.circleci.com/insights/github/ELEVATE-Project/user/workflows/buil-and-test/overview?branch=master&reporting-window=last-30-days&insights-snapshot=true)

</details>

<details><summary>dev</summary>

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/ELEVATE-Project/user/tree/dev.svg?style=shield)](https://dl.circleci.com/status-badge/redirect/gh/ELEVATE-Project/user/tree/dev)
![GitHub package.json version (subfolder of monorepo)](https://img.shields.io/github/package-json/v/ELEVATE-Project/user/dev?filename=src%2Fpackage.json)

[![CircleCI](https://dl.circleci.com/insights-snapshot/gh/ELEVATE-Project/user/dev/buil-and-test/badge.svg?window=30d)](https://app.circleci.com/insights/github/ELEVATE-Project/user/workflows/buil-and-test/overview?branch=dev&reporting-window=last-30-days&insights-snapshot=true)

<!-- [![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=ELEVATE-Project_mentoring&metric=duplicated_lines_density&branch=dev)](https://sonarcloud.io/summary/new_code?id=ELEVATE-Project_mentoring)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=ELEVATE-Project_mentoring&metric=coverage&branch=dev)](https://sonarcloud.io/summary/new_code?id=ELEVATE-Project_mentoring)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=ELEVATE-Project_mentoring&metric=vulnerabilities&branch=revert-77-integration-test)](https://sonarcloud.io/summary/new_code?id=ELEVATE-Project_mentoring) -->

</details>

</br>
The Mentor building block enables effective mentoring interactions between mentors and mentees. The capability aims to create a transparent eco-system to learn, connect, solve, and share within communities. Mentor is an open-source mentoring application that facilitates peer learning and professional development by creating a community of mentors and mentees.

</div>
<br>

# Setup Options

Elevate user services can be set in local using two methods:

<details><summary>Dockerized service with local dependencies(Intermediate)</summary>

**Expectation**: Run single docker containerized service with existing local (in host) or remote dependencies.

### Local Dependencies Steps

1. Update dependency (Mongo v4.1.4, Kafka etc) IP addresses in .env with "**host.docker.internal**".

    Eg:

    ```
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
    /ELEVATE/user$ docker build -t elevate/user:1.0 .
    ```
4. Run the docker container.

    - For Mac & Windows with docker v18.03+:

        ```
        $ docker run --name user elevate/user:1.0
        ```

    - For Linux:
        ```
        $ docker run --name user --add-host=host.docker.internal:host-gateway elevate/user:1.0`
        ```
        Refer [this](https://stackoverflow.com/a/24326540) for more information.

### Remote Dependencies Steps

1. Update dependency (Mongo v4.1.4, Kafka etc) Ip addresses in .env with respective remote server IPs.

    Eg:

    ```
     #DB Connectivity Url
     DATABASE_URL=postgres://postgres:postgres@localhost:5432/elevate-user

     #Kafka Host Server URL
     KAFKA_URL = 11.2.3.45:9092
    ```

2. Add Bind IP to **mongod.conf** in host:

    Follow instructions given [here.](https://www.digitalocean.com/community/tutorials/how-to-configure-remote-access-for-mongodb-on-ubuntu-20-04)

    Note: Instructions might differ based on MongoDB version and operating system.

3. Build the docker image.
    ```
    /ELEVATE/user$ docker build -t elevate/user:1.0 .
    ```
4. Run the docker container.

    ```
    $ docker run --name user elevate/user:1.0
    ```

</details>

<details><summary>Local Service with local dependencies(Hardest)</summary>

**Expectation**: Run single service with existing local dependencies in host (**Non-Docker Implementation**).

### Steps

1. Install required tools & dependencies

    Install any IDE (eg: VScode)

    Install Nodejs: https://nodejs.org/en/download/

    Install MongoDB: https://docs.mongodb.com/manual/installation/

    Install Robo-3T: ​​ https://robomongo.org/

2. Clone the **User service** repository.

    ```
    git clone https://github.com/ELEVATE-Project/user.git
    ```

3. Add **.env** file to the project directory

    Create a **.env** file in **src** directory of the project and copy these environment variables into it.

    ```
    #User Service Config

    # Port on which service runs
    APPLICATION_PORT = 3000

    # Service environment
    APPLICATION_ENV = development

    # Database connectivity url
    DATABASE_URL=postgres://postgres:postgres@localhost:5432/elevate-user

    # Token secret to generate access token
    ACCESS_TOKEN_SECRET = 'access-token-secret'

    # Token secret to generate refresh token
    REFRESH_TOKEN_SECRET = 'refresh-token-secret'

    # Kafka hosted server url
    KAFKA_URL = localhost:9092

    # Kafka group to which consumer belongs
    KAFKA_GROUP_ID = userservice

    # Kafka topic to consume data from
    KAFKA_TOPIC = 'topic'

    # Kafka topic to push notification data
    NOTIFICATION_KAFKA_TOPIC = notificationtopic

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

    # Internal access token for communication between services via network call
    INTERNAL_ACCESS_TOKEN = 'internal-access-token'

    #Enable logging of network request
    ENABLE_LOG = true

    # JWT Access Token expiry In Days
    ACCESS_TOKEN_EXPIRY = '1'

    # JWT Refresh Token expiry In Days
    REFRESH_TOKEN_EXPIRY = '183'

    # Redis Host connectivity url
    REDIS_HOST = 'redis://localhost:6379'

    # Otp expiration time for forgetpassword or registration process
    OTP_EXP_TIME = 86400

    # Enable email based otp verification for registration process
    ENABLE_EMAIL_OTP_VERIFICATION = true

    # Api doc url
    API_DOC_URL = '/api-doc'
    ```

4. Start MongoDB locally

    Based on your host operating system and method used, start MongoDB.

5. Install Npm packages

    ```
    ELEVATE/user/src$ npm install
    ```

6. Start User server

    ```
    ELEVATE/user/src$ npm start
    ```

</details>
<br>

# Tech stack

-   Node - 16.0.0
-   Kafka - 3.1.0
-   Jest - 28.1.1
-   MongoDB - 4.1.4
-   Redis - 7.0.0

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

# Used in

This project was built to be used with [Mentoring Service](https://github.com/ELEVATE-Project/mentoring.git).

Notification service repo can be found [here](https://github.com/ELEVATE-Project/notification.git).

The PWA [repo](https://github.com/ELEVATE-Project/mentoring-mobile-app).

You can learn more about the full implementation of Mentor [here](https://elevate-docs.shikshalokam.org/.mentorEd/intro) .
<br>

# Team

<a href="https://github.com/ELEVATE-Project/user/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ELEVATE-Project/user" />
</a>

<br>

# Open Source Dependencies

Several open source dependencies that have aided user service development:

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-000?style=for-the-badge&logo=apachekafka)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)
![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)

<!-- ![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)
![CircleCI](https://img.shields.io/badge/circle%20ci-%23161616.svg?style=for-the-badge&logo=circleci&logoColor=white) -->
