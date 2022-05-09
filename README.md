# User Service APIs

Recommend to,
Install any IDE in your system(eg: VScode etc..)
Install nodejs from : https://nodejs.org/en/download/
Install mongoDB: https://docs.mongodb.com/manual/installation/
Install Robo 3T: ​​https://robomongo.org/
Install kafka from : https://kafka.apache.org/downloads



## 1. Cloning the User repository into your system

Goto https://github.com/ELEVATE-Project/User From the code tab copy the link. Using that link clone the repository into your local machine.

Let's make it more easy for you:

    1. Create a new folder where you want to clone the repository.
    2. Goto that directory through the terminal and execute the commands.

git clone https://github.com/ELEVATE-Project/User.git


## 2. Add .env file to the project directory

    create  a file named as .env in root directory of the project and copy below code into that file.
    Add fallowing enviorment configs 



## 3. Run mongodb locally
   spacify the mongo port and ip in .env
   application takes the db as specified in the .env


### Required Environment variables:

````
```

#User Service Config

# Port on which service runs
APPLICATION_PORT = 3000

# Service environment
APPLICATION_ENV = development

# Database connectivity url
MONGODB_URL = mongodb://localhost:27017/db-name

# Number of rounds for encryption
SALT_ROUNDS = 10

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

# Internal access token for communicationcation between services via network call
INTERNAL_ACCESS_TOKEN = 'internal-access-token'

# Mentor screct code for registering
MENTOR_SECRET_CODE = 'secret-code'

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

```
````


## 4. Install Npm
	npm i
    To install the dependencies in your local machine.


## 5. To Run server
	npm start
