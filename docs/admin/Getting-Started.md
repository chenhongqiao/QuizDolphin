# Getting Started

Quiz Dolphin is designed to be set up effortless. Before starting this section, please make sure that you have obtained the following files/programs.

* The latest version of Quiz Dolphin's source code
* Docker runtime and docker-compose

You can follow this guide [Get Docker](https://docs.docker.com/get-docker/) to install docker.

## Build

After obtaining the source code and runtime, please open your operating system's terminal (Powershell for windows) and switch to the root directory of this project. You should see `README.md` and `docker-compose.yml` in this directory. Please enter this command in the terminal.

```shell
docker-compose build
```

Please give it about 5 to 10 minutes to build the image. (Time may vary on different hardware). You should see something like `Successfully tagged quizdolphin_web:latest` when the build process is done.

## Run

At this point, the program is built from source code and is ready to run. Please enter this command

```shell
docker-compose up -d
```

This command will set up the system with the default value of a series of [environment variables](#Environment-Variable). Some dependency images need to be pulled from the internet if it's the first running Quiz Dolphin. Time varies on the network connection, but typically it should not take more than 10 minutes. 

If you see something like `Creating quizdolphin_web_1 ... done`, that means the container is up and running, you can type `docker ps` to confirm that.

## First Time Usage

Great! Now Quiz Dolphin is up and running on the preset port (80 by default), if you are running the system on your machine, open a browser and visit ```localhost```, if it's running on a cloud server, make sure 80 port is allowed by the firewall and visit the IP of that machine in browser. You should see a window that looks like this.

![login prompt](../images/login_prompt.png)

The default email is `admin@example.com` and the default password is `CHANGEME`(case-sensitive), you can specify all these information in the environment variable. You should be able to login and see the *admin* home page.

![home page](../images/empty_home.png)

It's empty for now, but don't worry, we will learn how to create a quiz soon. Congratulations! You successfully setup Quiz Dolphin. Let's first take a look at the interface. 

First, at the top-right corner, there's a user avatar. You can click on the avatar and it will show the user's information and a logout button. If the logged in user is an admin, the avatar background will be grey-bluish color, if the logged in user is a regular user, the background will be light blue.

At the top-left corner, next to the hamburger menu and 'Quiz Dolphin' text, there's a top-bar breadcrumb navigation that shows where you are in the system. It's 'Home' for now but will change as you access different pages.

At the top-left corner, there's a hamburger menu that helps you navigate through different panels (referred to as 'Views' in the documentation), please click on that.

![menu](../images/menu.png)

As you can see, there are totally 4 panels in the system. We will talk about them one by one. Now, please navigate to [Admin Home](Admin-Home.md)  to learn more about the *admin* homepage and quiz creation.

## FBLA-Specific Information

On the first-run of the program, a Demo Quiz will be added to the quiz list and it will contain 50 questions as specified by FBLA Event Guidelines. You can use the *PREVIEW* page (will be introduced later in this documentation) to view all 50 questions, or, you can create and login to a regular user account (will be covered later in the documentation) to see the generated 5-questions quiz. Please notice that the generated 5-questions quiz may not contain all 5 types of questions, since generation is completely random.

## Environment Variable

- `PORT` The port Quiz Dolphin will be running on, default to `80`.

- `REDISHOST` Host of the redis server, default to `redis`. Please notice that docker-compose runs all services in one network.

- `REDISPORT` Port of the redis server, default to `6379`.

- `MONGOURL` URL of the mongodb server, default to `mongodb://root:CHANGEME@mongo:27017?retryWrites=true&w=majority`, please refer to mongodb documentation for specs about this url.

- `MONGODBNAME` Database name for Quiz Dolphin to store information, default to `production`.

- `COOKIESECRET` Secret used to generate cookie, default to `CHANGEME`.

- `RATELIMIT` How many API requests a user is allowed to perform in 2 seconds, default to `20`.

- `ADMINNAME` Name of the initial admin user, default to `Example Admin`.

- `ADMINEMAIL` Email of the initial admin user, default to `admin@example.com`.

- `ADMINPASSWORD` Password of the initial admin user, default to `CHANGEME`

Please refer to mongo docker image documentation and redis docker image documentation for information about environment variables of mongo and redis image.
