# ShikshaLokam Elevate Project Documentation

## System Requirements

-   **Operating System:** Ubuntu 22
-   **Node.js:** v20
-   **PostgreSQL:** 16
-   **Citus:** 12.1

## Install Node.js

Refer to the [NodeSource distributions installation scripts](https://github.com/nodesource/distributions#installation-scripts) for Node.js installation.

```bash
$ curl -SLO https://deb.nodesource.com/nsolid_setup_deb.sh
$ sudo chmod 500 nsolid_setup_deb.sh
$ sudo ./nsolid_setup_deb.sh 20
$ sudo apt-get install nodejs -y
```

## Install Build Essential

```bash
$ sudo apt-get install build-essential
```

## Install Kafka

Refer to [Kafka Ubuntu 22.04 setup guide](https://www.fosstechnix.com/install-apache-kafka-on-ubuntu-22-04-lts/)

1. Install OpenJDK 11:

    ```bash
    $ sudo apt install openjdk-11-jdk
    ```

2. Download and extract Kafka:

    ```bash
    $ sudo wget https://downloads.apache.org/kafka/3.5.0/kafka_2.12-3.5.0.tgz
    $ sudo tar xzf kafka_2.12-3.5.0.tgz
    $ sudo mv kafka_2.12-3.5.0 /opt/kafka
    ```

3. Configure Zookeeper:

    ```bash
    $ sudo nano /etc/systemd/system/zookeeper.service
    ```

    Paste the following lines into the `zookeeper.service` file:

    ```ini
    /etc/systemd/system/zookeeper.service
    [Unit]
    Description=Apache Zookeeper service
    Documentation=http://zookeeper.apache.org
    Requires=network.target remote-fs.target
    After=network.target remote-fs.target

    [Service]
    Type=simple
    ExecStart=/opt/kafka/bin/zookeeper-server-start.sh /opt/kafka/config/zookeeper.properties
    ExecStop=/opt/kafka/bin/zookeeper-server-stop.sh
    Restart=on-abnormal

    [Install]
    WantedBy=multi-user.target
    ```

    Save and exit.

4. Reload systemd:

    ```bash
    $ sudo systemctl daemon-reload
    ```

5. Configure Kafka:

    ```bash
    $ sudo nano /etc/systemd/system/kafka.service
    ```

    Paste the following lines into the `kafka.service` file:

    ```ini
    [Unit]
    Description=Apache Kafka Service
    Documentation=http://kafka.apache.org/documentation.html
    Requires=zookeeper.service

    [Service]
    Type=simple
    Environment="JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64"
    ExecStart=/opt/kafka/bin/kafka-server-start.sh /opt/kafka/config/server.properties
    ExecStop=/opt/kafka/bin/kafka-server-stop.sh

    [Install]
    WantedBy=multi-user.target
    ```

    Save and exit.

6. Reload systemd:

    ```bash
    $ sudo systemctl daemon-reload
    ```

7. Start Zookeeper:

    ```bash
    $ sudo systemctl start zookeeper
    ```

    Check status:

    ```bash
    $ sudo systemctl status zookeeper
    ```

    Zookeeper service status should be shown as active (running).

8. Start Kafka:

    ```bash
    $ sudo systemctl start kafka
    ```

    Check status:

    ```bash
    $ sudo systemctl status kafka
    ```

    Kafka status should be shown as active (running).

## Install Redis

Refer to [Redis Ubuntu 22.04 setup guide](https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-redis-on-ubuntu-22-04)

1. Update the package list:

    ```bash
    $ sudo apt update
    ```

2. Install Redis:

    ```bash
    $ sudo apt install redis-server
    ```

3. Configure Redis for systemd:

    ```bash
    $ sudo nano /etc/redis/redis.conf
    ```

    Find the `supervised` directive and change it to "systemd" as follows:

    ```conf
    . . .
    # If you run Redis from upstart or systemd, Redis can interact with your
    # supervision tree. Options:
    #   supervised no      - no supervision interaction
    #   supervised upstart - signal upstart by putting Redis into SIGSTOP mode
    #   supervised systemd - signal systemd by writing READY=1 to $NOTIFY_SOCKET
    #   supervised auto    - detect upstart or systemd method based on
    #                        UPSTART_JOB or NOTIFY_SOCKET environment variables
    # Note: these supervision methods only signal "process is ready."
    #       They do not enable continuous liveness pings back to your supervisor.
    supervised systemd
    . . .
    ```

    Save and exit.

4. Restart the Redis service:

    ```bash
    $ sudo systemctl restart redis.service
    ```

## Install Single-Node Citus (Distributed Database)

Refer to [official Citus single-node setup](https://docs.citusdata.com/en/stable/installation/single_node_debian.html)

1. Download and install Citus:

    ```bash
    $ curl https://install.citusdata.com/community/deb.sh | sudo bash
    $ sudo apt-get -y install postgresql-16-citus-12.1
    ```

2. Switch to the PostgreSQL user:

    ```bash
    $ sudo su - postgres
    ```

3. Set the PostgreSQL bin directory in the PATH and create a directory for Citus:

    ```bash
    $ export PATH=$PATH:/usr/lib/postgresql/16/bin
    $ cd ~
    $ mkdir citus
    ```

4. Initialize the Citus database:

    ```bash
    $ initdb -D citus
    ```

5. Configure Citus in `citus/postgresql.conf`:

    ```bash
    $ echo "shared_preload_libraries = 'citus'" >> citus/postgresql.conf
    ```

6. Start the Citus server:

    ```bash
    $ pg_ctl -D citus -o "-p 9700" -l citus_logfile start
    ```

7. Create the Citus extension:

    ```bash
    $ psql -p 9700 -c "CREATE EXTENSION citus;"
    ```

8. Check the Citus version:

    ```bash
    $ psql -p 9700 -c "select citus_version();"
    ```

    You should see an output similar to the following, indicating that Citus is successfully installed:

    ```sql
    postgres=# select citus_version();
                                           citus_version
    ----------------------------------------------------------------------------------------------------
     Citus 12.1.1 on x86_64-pc-linux-gnu, compiled by gcc (Ubuntu 9.4.0-1ubuntu1~20.04.2) 9.4.0, 64-bit
    (1 row)
    ```

## Install PM2

Refer to [How To Set Up a Node.js Application for Production on Ubuntu 22.04](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-22-04).

**Exit the postgres user account**

```bash
$ exit
```

```bash
$ sudo npm install pm2@latest -g
```

## Setting up Repositories

### Clone the repositories

```bash
$ cd /opt/
$ sudo mkdir backend
$ cd backend/
$ git clone -b develop-2.5 --single-branch "https://github.com/ELEVATE-Project/mentoring.git"
$ git clone -b develop-2.5 --single-branch "https://github.com/ELEVATE-Project/user.git"
$ git clone -b develop-2.5 --single-branch "https://github.com/ELEVATE-Project/notification.git"
$ git clone -b develop --single-branch "https://github.com/ELEVATE-Project/scheduler.git"
$ git clone -b develop --single-branch "https://github.com/ELEVATE-Project/interface-service.git"
```

### Install Npm packages

```bash
$ cd /opt/backend/mentoring/src
$ sudo npm i
$ cd ../../user/src
$ sudo npm i
$ cd ../../notification/src
$ sudo npm i
$ cd ../../scheduler/src
$ sudo npm i
$ cd ../../interface-service/src
$ sudo npm i
```

### Create .env files

#### Mentoring service

```bash
$ cd /opt/backend/mentoring/src or ../../mentoring/src
$ sudo nano .env
```

Copy-paste the following env variables to the `.env` file:

```env
# Mentoring Service Config

# Port on which service runs
APPLICATION_PORT=3000

# Service environment
APPLICATION_ENV=development

# Route after the base URL
APPLICATION_BASE_URL=/mentoring/
APPLICATION_URL=https://dev.mentoring.shikshalokam.org

# Mongo db connectivity URL
MONGODB_URL=mongodb://localhost:27017/elevate-mentoring

# Token secret to verify the access token
ACCESS_TOKEN_SECRET='asadsd8as7df9as8df987asdf'

# Internal access token for communication between services via network call
INTERNAL_ACCESS_TOKEN='internal_access_token'

# Kafka hosted server URL
KAFKA_URL=localhost:9092

# Kafka group to which consumer belongs
KAFKA_GROUP_ID="mentoring"

# Kafka topic to push notification data
NOTIFICATION_KAFKA_TOPIC='develop.notifications'

# Kafka topic name to consume from mentoring topic
KAFKA_MENTORING_TOPIC="mentoringtopic"
SESSION_KAFKA_TOPIC='session'

# Kafka topic to push recording data
KAFKA_RECORDING_TOPIC="recordingtopic"

# Any one of three features available for cloud storage
CLOUD_STORAGE='AWS'
MENTOR_SESSION_RESCHEDULE_EMAIL_TEMPLATE=mentor_session_reschedule

# GCP json config file path
GCP_PATH='gcp.json'

# GCP bucket name which stores files
DEFAULT_GCP_BUCKET_NAME='gcp-bucket-storage-name'

# GCP project id
GCP_PROJECT_ID='project-id'

# AWS access key id
AWS_ACCESS_KEY_ID='aws-access-key-id'

# AWS secret access key
AWS_SECRET_ACCESS_KEY='aws-secret-access-key'

# AWS region where the bucket will be located
AWS_BUCKET_REGION='ap-south-1'

# AWS endpoint
AWS_BUCKET_ENDPOINT='s3.ap-south-1.amazonaws.com'

# AWS bucket name which stores files
DEFAULT_AWS_BUCKET_NAME='aws-bucket-storage-name'

# Azure storage account name
AZURE_ACCOUNT_NAME='account-name'

# Azure storage account key
AZURE_ACCOUNT_KEY='azure-account-key'

# Azure storage container which stores files
DEFAULT_AZURE_CONTAINER_NAME='azure-container-storage-name'

# User service host
USER_SERVICE_HOST='http://localhost:3001'

# User service base URL
USER_SERVICE_BASE_URL='/user/'

# Big blue button URL
BIG_BLUE_BUTTON_URL=https://dev.some.temp.org

# Big blue button base URL
BIB_BLUE_BUTTON_BASE_URL=/bigbluebutton/

# Meeting end callback events endpoint
MEETING_END_CALLBACK_EVENTS=https%3A%2F%2Fdev.some-apis.temp.org%2Fmentoring%2Fv1%2Fsessions%2Fcompleted

# Big blue button secret key
BIG_BLUE_BUTTON_SECRET_KEY=sa9d0f8asdg7a9s8d7f

# Big blue button recording ready callback URL
RECORDING_READY_CALLBACK_URL=http%3A%2F%2Flocalhost%3A3000%2F%3FmeetingID%3Dmeet123
BIG_BLUE_BUTTON_SECRET_KEY="s90df8g09sd8fg098sdfg"

# Enable logging of network requests
ENABLE_LOG=true

# API doc URL
API_DOC_URL='/api-doc'

# Internal cache expiry time
INTERNAL_CACHE_EXP_TIME=86400

# Redis Host connectivity URL
REDIS_HOST='redis://localhost:6379'

# Kafka internal communication
CLEAR_INTERNAL_CACHE='mentoringInternal'

# Enable email for reported issues
ENABLE_EMAIL_FOR_REPORT_ISSUE=true

# Email ID of the support team
SUPPORT_EMAIL_ID='support@xyz.com,team@xyz.com'

# Email template code for reported issues
REPORT_ISSUE_EMAIL_TEMPLATE_CODE='user_issue_reported'

BIG_BLUE_BUTTON_SESSION_END_URL='https%3A%2F%2Fdev.some-mentoring.temp.org%2F'

SCHEDULER_SERVICE_ERROR_REPORTING_EMAIL_ID="rakesh.k@some.com"
SCHEDULER_SERVICE_URL="http://localhost:4000/jobs/scheduleJob"
ERROR_LOG_LEVEL='silly'
DISABLE_LOG=false
DEFAULT_MEETING_SERVICE="BBB"
# BIG_BLUE_BUTTON_LAST_USER_TIMEOUT_MINUTES=15
SESSION_EDIT_WINDOW_MINUTES=0
SESSION_MENTEE_LIMIT=5
DEV_DATABASE_URL=postgres://shikshalokam:slpassword@localhost:9700/elevate_mentoring
MENTOR_SESSION_DELETE_EMAIL_TEMPLATE='mentor_session_delete'

SCHEDULER_SERVICE_HOST="http://localhost:4000"
SCHEDULER_SERVICE_BASE_URL= '/scheduler/'
DEFAULT_ORGANISATION_CODE="default_code"

REFRESH_VIEW_INTERVAL=30000
MENTEE_SESSION_ENROLLMENT_EMAIL_TEMPLATE=mentee_session_enrollment
DEFAULT_ORG_ID=1
```

Save and exit.

#### User service

```bash
$ cd ../../user/src
$ sudo nano .env
```

Copy-paste the following env variables to the `.env` file:

```env
ACCESS_TOKEN_EXPIRY=1
ACCESS_TOKEN_SECRET=asadsd8as7df9as8df987asdf
API_DOC_URL=/user/api-doc
APP_NAME=MentorED
APPLICATION_ENV=development
APPLICATION_PORT=3001
AWS_ACCESS_KEY_ID="adsfg98a7sdfg"
AWS_BUCKET_ENDPOINT="s3.ap-south-1.amazonaws.com"
AWS_BUCKET_REGION="ap-south-1"
AWS_SECRET_ACCESS_KEY="asd9786fg9a8sd/asdfg9a8sd7fg"
AZURE_ACCOUNT_KEY=asd897gfa09sd87f09as8d
AZURE_ACCOUNT_NAME=mentoring
CLEAR_INTERNAL_CACHE=userinternal
CLOUD_STORAGE=AWS
DEFAULT_AWS_BUCKET_NAME=mentoring-dev-storage
DEFAULT_AZURE_CONTAINER_NAME=mentoring-images
DEFAULT_GCP_BUCKET_NAME=mentoring-dev-storage


ENABLE_EMAIL_OTP_VERIFICATION=false
ENABLE_LOG=true
GCP_PATH=gcp.json
GCP_PROJECT_ID=sl-dev-project
INTERNAL_ACCESS_TOKEN=internal_access_token
INTERNAL_CACHE_EXP_TIME=86400
IV=09sdf8g098sdf/Q==
KAFKA_GROUP_ID=mentoring
KAFKA_TOPIC=
KAFKA_URL=localhost:9092
KEY=fasd98fg9a8sydg98a7usd89fg
MONGODB_URL=mongodb://localhost:27017/elevate-users
NOTIFICATION_KAFKA_TOPIC=dev.notifications
OTP_EMAIL_TEMPLATE_CODE=emailotp
OTP_EXP_TIME=86400
REDIS_HOST=redis://localhost:6379
REFRESH_TOKEN_EXPIRY=183
REFRESH_TOKEN_SECRET=as9d87fa9s87df98as7d9f87a9sd87f98as7dg987asf
REGISTRATION_EMAIL_TEMPLATE_CODE=registration
REGISTRATION_OTP_EMAIL_TEMPLATE_CODE=registrationotp

DEFAULT_OCI_BUCKET_NAME=dev-mentoring
OCI_ACCESS_KEY_ID=asdgf6a0s98d76g9a8sasdasd7df987as98df
OCI_BUCKET_ENDPOINT=https://as98d7asdasdf.compat.objectstorage.ap-hyderabad-1.oraclecloud.com
OCI_BUCKET_REGION=ap-hyderabad-1
OCI_SECRET_ACCESS_KEY=as09d7f8/as0d7f09as7d8f=

ERROR_LOG_LEVEL=silly
DISABLE_LOG=false
DEFAULT_ORGANISATION_CODE=default_code

DEV_DATABASE_URL=postgres://shikshalokam:slpassword@localhost:9700/elevate_user
ADMIN_SECRET_CODE=a98sd76fasdfasd
MENTORING_SERVICE_URL=test
DEFAULT_QUEUE="test"

INVITEE_EMAIL_TEMPLATE_CODE='test'
ADMIN_INVITEE_UPLOAD_EMAIL_TEMPLATE_CODE='test'
# Default role
DEFAULT_ROLE="mentee"

# Sample file upload path
SAMPLE_CSV_FILE_PATH=sample/bulk_user_creation.csv

# Email template for org admin invitation
ORG_ADMIN_INVITATION_EMAIL_TEMPLATE_CODE=invite_org_admin
DEFAULT_ORG_ID=1
MENTORING_SERVICE_URL=http://mentoring:3000
# Email template for mentor role request accepted
MENTOR_REQUEST_ACCEPTED_EMAIL_TEMPLATE_CODE=mentor_request_accepted

# Email template for mentor role request rejected
MENTOR_REQUEST_REJECTED_EMAIL_TEMPLATE_CODE=mentor_request_rejected
DEFAULT_ROLE=mentee
PORTAL_URL='https://mentored.some.org/auth/login'
SCHEDULER_SERVICE_ERROR_REPORTING_EMAIL_ID="rakesh.k@some.com"
SCHEDULER_SERVICE_URL="http://localhost:4000/jobs/scheduleJob"
SCHEDULER_SERVICE_HOST="http://localhost:4000"
SCHEDULER_SERVICE_BASE_URL= '/scheduler/'
REFRESH_VIEW_INTERVAL=540000
```

Save and exit.

#### Notification Service

```bash
$ cd ../../notification/src
$ sudo nano .env
```

Copy-paste the following env variables to the `.env` file:

```env
# Notification Service Config

# Port on which service runs
APPLICATION_PORT=3002

# Application environment
APPLICATION_ENV=development

# Route after the base URL
APPLICATION_BASE_URL=/notification/

# Kafka endpoint
KAFKA_HOST="localhost:9092"

# Kafka topic name
KAFKA_TOPIC="develop.notifications"

# Kafka consumer group id
KAFKA_GROUP_ID="notification"

# Sendgrid API key
# SENDGRID_API_KEY="SG.asd89f7a9s8d7f.as9d8f7a9s8d7f-asd98f76as987df"
SENDGRID_API_KEY="SG.asd9f87a9s8d7f."

# Sendgrid sender email address
SENDGRID_FROM_MAIL="no-reply@some.org"

# Api doc URL
API_DOC_URL='/api-doc'

INTERNAL_ACCESS_TOKEN="internal_access_token"
ENABLE_LOG=true
ERROR_LOG_LEVEL='silly'
DISABLE_LOG=false
DEV_DATABASE_URL=postgres://shikshalokam:slpassword@localhost:9700/elevate_notification
```

Save and exit.

#### Scheduler Service

```bash
$ cd ../../scheduler/src
$ sudo nano .env
```

Copy-paste the following env variables to the `.env` file:

```env
# Scheduler Service Config

# Application Base URL
APPLICATION_BASE_URL=/scheduler/

# Kafka hosted server URL
KAFKA_URL=localhost:9092

# Kafka topic to push notification data
NOTIFICATION_KAFKA_TOPIC='develop.notifications'

# MongoDB URL
MONGODB_URL='mongodb://localhost:27017/tl-cron-rest'

# App running port
APPLICATION_PORT=4000

# Api doc URL
API_DOC_URL='/api-doc'

APPLICATION_ENV=development

ENABLE_LOG='true'

ERROR_LOG_LEVEL='silly'
DISABLE_LOG=false

DEFAULT_QUEUE='email'

REDIS_HOST='localhost'
REDIS_PORT=6379
```

Save and exit.

#### Interface Service

```bash
$ cd ../../interface-service/src
$ sudo nano .env
```

Copy-paste the following env variables to the `.env` file:

```env
APPLICATION_PORT=3569
APPLICATION_ENV='development'
REQUIRED_PACKAGES="elevate-user@1.1.30 elevate-mentoring@1.1.23 elevate-scheduler@1.0.4"
SUPPORTED_HTTP_TYPES="GET POST PUT PATCH DELETE"
USER_SERVICE_BASE_URL='http://localhost:3001'
MENTORING_SERVICE_BASE_URL='http://localhost:3000'
NOTIFICATION_SERVICE_BASE_URL='http://localhost:3002'
SCHEDULER_SERVICE_BASE_URL='http://scheduler:4000'
```

Save and exit.

## Setting up Databases

**Log into the postgres user**

```bash
sudo su postgres
```

**Log into psql**

```bash
psql -p 9700
```

**Create a database user/role:**

```sql
CREATE USER shikshalokam WITH ENCRYPTED PASSWORD 'slpassword';
```

**Create the elevate_mentoring database**

```sql
CREATE DATABASE elevate_mentoring;
GRANT ALL PRIVILEGES ON DATABASE elevate_mentoring TO shikshalokam;
\c elevate_mentoring
GRANT ALL ON SCHEMA public TO shikshalokam;
```

**Create the elevate_user database**

```sql
CREATE DATABASE elevate_user;
GRANT ALL PRIVILEGES ON DATABASE elevate_user TO shikshalokam;
\c elevate_user
GRANT ALL ON SCHEMA public TO shikshalokam;
```

**Create the elevate_notification database**

```sql
CREATE DATABASE elevate_notification;
GRANT ALL PRIVILEGES ON DATABASE elevate_notification TO shikshalokam;
\c elevate_notification
GRANT ALL ON SCHEMA public TO shikshalokam;
```

## Running Migrations To Create Tables

**Exit the postgres user account**

```bash
exit (run twice)
```

**Install sequelize-cli globally**

```bash
sudo npm i sequelize-cli -g
```

**Navigate to the src folder of mentoring, user, and notification services and run sequelize-cli migration command:**

```bash
cd /opt/backend/mentoring/src
npx sequelize-cli db:migrate
```

```bash
cd ../../user/src
npx sequelize-cli db:migrate
```

```bash
cd ../../notification/src
npx sequelize-cli db:migrate
```

**Now all the tables must be available in the Citus databases**

## Setting up Distribution Columns in Citus PostgreSQL Database

Refer [Choosing Distribution Column](https://docs.citusdata.com/en/stable/sharding/data_modeling.html) for more information regarding Citus distribution columns.

**Login into the postgres user**

```bash
sudo su postgres
```

**Login to psql**

```bash
psql -p 9700
```

**Login to the elevate_mentoring database**

```sql
\c elevate_mentoring
```

**Enable Citus for elevate_mentoring**

```sql
CREATE EXTENSION citus;
```

**Within elevate_mentoring, run the following queries:**

```sql
SELECT create_distributed_table('entities', 'entity_type_id');
SELECT create_distributed_table('entity_types', 'organization_id');
SELECT create_distributed_table('feedbacks', 'user_id');
SELECT create_distributed_table('forms', 'organization_id');
SELECT create_distributed_table('issues', 'id');
SELECT create_distributed_table('mentor_extensions', 'user_id');
SELECT create_distributed_table('notification_templates', 'organization_id');
SELECT create_distributed_table('organization_extension', 'organization_id');
SELECT create_distributed_table('post_session_details', 'session_id');
SELECT create_distributed_table('questions', 'id');
SELECT create_distributed_table('question_sets', 'code');
SELECT create_distributed_table('session_attendees', 'session_id');
SELECT create_distributed_table('session_enrollments', 'mentee_id');
SELECT create_distributed_table('session_ownerships', 'mentor_id');
SELECT create_distributed_table('sessions', 'id');
SELECT create_distributed_table('user_extensions', 'user_id');
```

**Login to the elevate_user database**

```sql
\c elevate_user
```

**Enable Citus for elevate_user**

```sql
CREATE EXTENSION citus;
```

**Within elevate_user, run the following queries:**

```sql
SELECT create_distributed_table('entities', 'entity_type_id');
SELECT create_distributed_table('entity_types', 'organization_id');
SELECT create_distributed_table('file_uploads', 'organization_id');
SELECT create_distributed_table('forms', 'organization_id');
SELECT create_distributed_table('notification_templates', 'organization_id');
SELECT create_distributed_table('organizations', 'id');
SELECT create_distributed_table('organization_codes', 'code');
SELECT create_distributed_table('organization_domains', 'domain');
SELECT create_distributed_table('organization_role_requests','organization_id');
SELECT create_distributed_table('organization_user_invites','organization_id');
SELECT create_distributed_table('users_credentials','email');
SELECT create_distributed_table('users', 'organization_id');
```

## Running Seeder to Populate the Tables with Seed Data

**Exit the postgres user**

```bash
exit (run twice)
```

**Navigate to the src/scripts directory of the user service**

```bash
cd /opt/backend/user/src/scripts
```

**Run the insertDefaultOrg.js script**

```bash
node insertDefaultOrg.js
```

_Keep note of the default organization id generated by the script_

**Navigate to the src folder of the user service and update the .env file with these variables:**

```bash
sudo nano /opt/backend/user/src/.env
```

```env
DEFAULT_ORG_ID=<id generated by the insertDefaultOrg script>
DEFAULT_ORGANISATION_CODE=default_code
```

**Run the seeder command**

```bash
cd /opt/backend/user/src
npm run db:seed:all
```

**Navigate to the src folder of the mentoring service and update the .env file with these variables:**

```bash
sudo nano /opt/backend/mentoring/src/.env
```

```env
DEFAULT_ORG_ID=<id generated by the insertDefaultOrg script>
DEFAULT_ORGANISATION_CODE=default_code
```

**Run the seeder command**

```bash
cd /opt/backend/mentoring/src
npm run db:seed:all
```

## Start the Services

Navigate to the src folder of all 5 services and run pm2 start command:

```bash
$ cd /opt/backend/mentoring/src
mentoring/src$ pm2 start app.js -i 2 --name elevate-mentoring

$ cd /opt/backend/user/src
user/src$ pm2 start app.js -i 2 --name elevate-user

$ cd /opt/backend/notification/src
notification/src$ pm2 start app.js -i 2 --name elevate-notification

$ cd /opt/backend/interface-service/src
interface-service/src$ pm2 start app.js -i 2 --name elevate-interface

$ cd /opt/backend/scheduler/src
scheduler/src$ pm2 start app.js -i 2 --name elevate-scheduler
```

#### Run pm2 ls command

```bash
$ pm2 ls
```

Output should look like this (Sample output, might slightly differ in your installation):

```bash
┌────┬─────────────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name                    │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├────┼─────────────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 6  │ elevate-interface       │ default     │ 1.0.0   │ cluster │ 79252    │ 2D     │ 0    │ online    │ 0%       │ 79.2mb   │ jenkins  │ disabled │
│ 7  │ elevate-interface       │ default     │ 1.0.0   │ cluster │ 79262    │ 2D     │ 0    │ online    │ 0%       │ 78.7mb   │ jenkins  │ disabled │
│ 23 │ elevate-mentoring       │ default     │ 1.0.0   │ cluster │ 90643    │ 46h    │ 0    │ online    │ 0%       │ 171.0mb  │ jenkins  │ disabled │
│ 24 │ elevate-mentoring       │ default     │ 1.0.0   │ cluster │ 90653    │ 46h    │ 0    │ online    │ 0%       │ 168.9mb  │ jenkins  │ disabled │
│ 19 │ elevate-notification    │ default     │ 1.0.0   │ cluster │ 88026    │ 47h    │ 0    │ online    │ 0%       │ 113.2mb  │ jenkins  │ disabled │
│ 20 │ elevate-notification    │ default     │ 1.0.0   │ cluster │ 88036    │ 47h    │ 0    │ online    │ 0%       │ 80.3mb   │ jenkins  │ disabled │
│ 15 │ elevate-scheduler       │ default     │ 1.0.0   │ cluster │ 86368    │ 47h    │ 0    │ online    │ 0%       │ 89.8mb   │ jenkins  │ disabled │
│ 16 │ elevate-scheduler       │ default     │ 1.0.0   │ cluster │ 86378    │ 47h    │ 0    │ online    │ 0%       │ 86.9mb   │ jenkins  │ disabled │
│ 29 │ elevate-user            │ default     │ 1.0.0   │ cluster │ 106976   │ 27h    │ 0    │ online    │ 0%       │ 167.0mb  │ jenkins  │ disabled │
│ 30 │ elevate-user            │ default     │ 1.0.0   │ cluster │ 106986   │ 27h    │ 0    │ online    │ 0%       │ 169.3mb  │ jenkins  │ disabled │
└────┴─────────────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

This concludes the services and dependency setup.

## Postman Collections

-   [User Service](https://github.com/ELEVATE-Project/user/tree/develop-2.5/src/api-doc)
-   [Mentoring Service](https://github.com/ELEVATE-Project/mentoring/tree/develop-2.5/src/api-doc)
