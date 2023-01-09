## Prerequisites

I assume you have installed Docker and it is running.

See the [Docker website](http://www.docker.io/gettingstarted/#h_installation) for installation instructions.

To pull the docker image

    ``` docker pull shikshalokamqa/elevate-user:version ```

    ex :

    ``` docker pull shikshalokamqa/elevate-user:version:2.2 ```

To run

        ``` docker run shikshalokamqa/elevate-user:version ```

        with port number

        ``` ``` docker run shikshalokamqa/elevate-user:version ```

       You can pass the .env file as argument to the image

        ex:

        ``` docker run --env-file="path of the env file" shikshalokamqa/elevate-user:2.2 ```

        For more information about the elevate-users env file, you can check the below sample env

        https://github.com/ELEVATE-Project/user/blob/master/src/.env.sample

To run the elevate-users, you can go with the docker compose, using the below docker-compose you can start the application

        https://github.com/ELEVATE-Project/user

    Docker compose commands
        1. Create or start all containers:

            ``` docker compose up  ``

        2. To start elevate-user application with .env file  using below command

            ``` env_file="path of the env file" docker compose up ```



