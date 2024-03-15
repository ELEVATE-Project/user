# ShikshaLokam User Project Documentation

## System Requirements

-   **Operating System:** Ubuntu 22
-   **Node.js:** v20
-   **PostgreSQL:** 16
-   **Citus:** 12.1
-   **Apache Kafka:** 3.5.0

## Installations

### Install Node.js LTS

Refer to the [NodeSource distributions installation scripts](https://github.com/nodesource/distributions#installation-scripts) for Node.js installation.

```bash
$ curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - &&\
sudo apt-get install -y nodejs
```

### Install Build Essential

```bash
$ sudo apt-get install build-essential
```

### Install Kafka

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

### Install Redis

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

### Install Single-Node Citus (Distributed Database)

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

### Install PM2

Refer to [How To Set Up a Node.js Application for Production on Ubuntu 22.04](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-22-04).

**Exit the postgres user account and run the following command**

```bash
$ sudo npm install pm2@latest -g
```

## Setting up Repository

### Clone the user repository to /opt/backend directory

```bash
opt/backend$ git clone -b develop-2.5 --single-branch "https://github.com/ELEVATE-Project/user.git"
```

### Install Npm packages from src directory

```bash
backend/user/src$ sudo npm i
```

### Create .env file in src directory

```bash
user/src$ sudo nano .env
```

Copy-paste the following env variables to the `.env` file:

NB : Make sure to update the credentials according to your configurations.

```env
ACCESS_TOKEN_EXPIRY= 10
ACCESS_TOKEN_SECRET= asadsd8as7df9as8df987asdf
ADMIN_INVITEE_UPLOAD_EMAIL_TEMPLATE_CODE= invitee_upload_status
ADMIN_SECRET_CODE= Na7ad23ws5cm3kfmw24dmdsflaksd
API_DOC_URL=/user/api-doc
APPLICATION_ENV=development
APPLICATION_PORT=3001
APP_NAME=MentorED

AWS_ACCESS_KEY_ID= "adsfg98a7sdfg"
AWS_BUCKET_ENDPOINT="s3.ap-south-1.amazonaws.com"
AWS_BUCKET_REGION="ap-south-1"
AWS_SECRET_ACCESS_KEY="asd9786fg9a8sd/asdfg9a8sd7fg"


AZURE_ACCOUNT_KEY=asd897gfa09sd87f09as8d
AZURE_ACCOUNT_NAME=mentoring
CLEAR_INTERNAL_CACHE=userinternal
CLOUD_STORAGE= GCP
DEFAULT_AWS_BUCKET_NAME=mentoring-dev-storage
DEFAULT_AZURE_CONTAINER_NAME=mentoring-images
DEFAULT_GCP_BUCKET_NAME=mentoring-dev-storage

DEFAULT_ORGANISATION_CODE= default_code
DEFAULT_ORG_ID= 1
DEFAULT_QUEUE= user-queue
DEFAULT_ROLE= mentee
DEV_DATABASE_URL= postgres://shikshalokam:slpassword123@localhost:9700/elevate_user
DISABLE_LOG= false
EMAIL_ID_ENCRYPTION_ALGORITHM= aes-256-cbc
EMAIL_ID_ENCRYPTION_IV= a19f1ewaqwei9e03edkc32e
EMAIL_ID_ENCRYPTION_KEY= 9bszawjkckw2e3dm35fcw27ws4ed5rftg6y6y7y7654tf4rwq5tr0ol2qa9owsie
ENABLE_EMAIL_OTP_VERIFICATION=true
ENABLE_LOG=true
ERROR_LOG_LEVEL=silly
EVENT_ENABLE_ORG_EVENTS=true
EVENT_ORG_LISTENER_URLS=http://localhost:3567/mentoring/v1/organization/eventListener
GCP_PATH=gcp.json
GCP_PROJECT_ID=sl-dev-project
GENERIC_INVITATION_EMAIL_TEMPLATE_CODE=generic_invite
INTERNAL_ACCESS_TOKEN= Fqdkfaswekdlwe
INTERNAL_CACHE_EXP_TIME= 86400
INVITEE_EMAIL_TEMPLATE_CODE= invite_user
IV= LKYTTAqkajswiawqw/Z==
KAFKA_GROUP_ID=dev.users
KAFKA_TOPIC= dev.topic
KAFKA_URL= localhost:9092
KEY= W/m2cr/aMswjrdsa23sgfy5e34d+bKcbAWZSLjJP2qY=
MENTEE_INVITATION_EMAIL_TEMPLATE_CODE= invite_mentee
MENTORING_SERVICE_URL= http://localhost:3000
MENTOR_INVITATION_EMAIL_TEMPLATE_CODE= invite_mentor
MENTOR_REQUEST_ACCEPTED_EMAIL_TEMPLATE_CODE= mentor_request_accepted
MENTOR_REQUEST_REJECTED_EMAIL_TEMPLATE_CODE= mentor_request_rejected
MENTOR_SECRET_CODE=4567
NOTIFICATION_KAFKA_TOPIC=dev.notification
ORG_ADMIN_INVITATION_EMAIL_TEMPLATE_CODE= invite_org_admin
OTP_EMAIL_TEMPLATE_CODE= emailotp
OTP_EXP_TIME= 86400
PORTAL_URL= "https://dev.elevate-mentoring.shikshalokam.org/auth/login"
RATING_KAFKA_TOPIC= dev.mentor_rating
REDIS_HOST= redis://localhost:6379
REFRESH_TOKEN_EXPIRY= 183
REFRESH_TOKEN_SECRET=371hkjadidy2ashiKAkajshdkid23iuekw71yekiaskdvkvegxvy23t78veQwexqviveit6ttZyeeytx62tx236uv
REFRESH_VIEW_INTERVAL=30000
REGISTRATION_EMAIL_TEMPLATE_CODE= registration
REGISTRATION_OTP_EMAIL_TEMPLATE_CODE= registrationotp
SALT_ROUNDS= 10
SAMPLE_CSV_FILE_PATH= sample/bulk_user_creation.csv
SCHEDULER_SERVICE_BASE_URL= /scheduler/
SCHEDULER_SERVICE_ERROR_REPORTING_EMAIL_ID= rakesh.k@pacewisdom.com
SCHEDULER_SERVICE_HOST= http://localhost:3567
SCHEDULER_SERVICE_URL= http://localhost:3567/jobs/scheduleJob
created_time= 2024-02-08T07:40:04.571464939Z
custom_metadata= null
destroyed= false
version= 31

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

**Create the elevate_user database**

```sql
CREATE DATABASE elevate_user;
GRANT ALL PRIVILEGES ON DATABASE elevate_user TO shikshalokam;
\c elevate_user
GRANT ALL ON SCHEMA public TO shikshalokam;
```

## Running Migrations To Create Tables

**Exit the postgres user account and install sequelize-cli globally**

```bash
$ sudo npm i sequelize-cli -g
```

**Navigate to the src folder of user service and run sequelize-cli migration command:**

```bash
user/src$ npx sequelize-cli db:migrate
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

**Exit the postgres user navigate to the script folder of the user service**

**Run the insertDefaultOrg.js script**

```bash
src/scripts$ node insertDefaultOrg.js
```

_Keep note of the default organization id generated by the script_

**Navigate to the src folder of the user service and update the .env file with these variables:**

```env
DEFAULT_ORG_ID=<id generated by the insertDefaultOrg script>
DEFAULT_ORGANISATION_CODE=default_code
```

**Run the seeder command**

```bash
src$ npm run db:seed:all
```

## Start the Service

Run pm2 start command:

```bash
user/src$ pm2 start app.js -i 2 --name elevate-user
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
│ 1  │ elevate-user            │ default     │ 1.0.0   │ cluster │ 106976   │ 27h    │ 0    │ online    │ 0%       │ 167.0mb  │ jenkins  │ disabled │
│ 2  │ elevate-user            │ default     │ 1.0.0   │ cluster │ 106986   │ 27h    │ 0    │ online    │ 0%       │ 169.3mb  │ jenkins  │ disabled │
└────┴─────────────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

This concludes the services and dependency setup.

## Postman Collections

-   [User Service](https://github.com/ELEVATE-Project/user/tree/develop-2.5/src/api-doc)
