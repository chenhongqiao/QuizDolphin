# Quiz Dolphin

A FBLA 2021 Coding and Programming Project.

## Overview

Although FBLA Event Guidelines only requires contestant to create a system that generates a fixed 5-questions quiz, Quiz Dolphin is a very flexible multi-purpose quiz systems that can be used in different scenarios. 

This system allows teachers to freely create quizzes and add different types of questions easily. This system also allows students to focus on the questions they are answering by handling all other hassels for them (such as auto progress-saving and non-distractive timer).

This system contains useful analytical functions so teachers can easily see how students did and students can easily see their improvements.

This system stores all the information in the backend and limits user's access to data by verifying their identities on api request. This system only stores user's hashed password to ensure their password's plaintext won't be leaked even if our database is tempered.

Quiz Dolphin is production ready and can be deployed easily with docker. Try it out on your device!

## Getting Started

Please refer to [Getting Started](docs/admin/Getting-Started.md) for program setup instructions.

## Libraries and Templates

Please refer to [Library List](LIBRARY.md) for libraries and permissions.

## Project Structure

- `docs` folder contains documentations.
- `client` folder contains frontend source code.
- `server` folder contains backend source code.

```
.
├── client (everything used to build the frontend)
│   ├── public (htmls)
│   └── src (frontend source code)
│       ├── assets (static files such as favicon)
│       ├── components (vue components)
│       │   └── admin (admin-specific components such as editing window)
│       ├── plugins (vuetify plugins)
│       ├── router (vue router)
│       ├── services (js methods used to communicate with the backend)
│       ├── store (global states)
│       │   └── modules (store modules)
│       └── views (vue views, aka pages)
│           ├── admin (admin-specific pages)
│           ├── status (status pages, such as 404)
│           └── user (user-specific pages)
├── docs (documentations)
│   ├── admin (documentations about setup and managing the system)
│   ├── images (screeshots)
│   └── user (documentations about using the system)
└── server (everything used to build the backend)
    ├── demo (where the FBLA-specified 50 questions are stored)
    └── src (backend source code)
        ├── api (api controllers, not commented becuase no business logic)
        ├── databases (database access methods)
        ├── jobs (tasks)
        ├── models (object constructors, no business logic)
        ├── services (backend services, contains most business logics)
        └── utils (utilities)
```

## Event-specific Information

This repository is made public on Feb 23, 2021. No collaboration is involved in the development process of this program. No modification is made to this project after Feb 23, 2021.

This project contains commentary with the purpose of assisting the reader to understand project logics and design, thus some files do not contain commentary because they are either

- Vue Templates, describes layout rather than logics (like html)

- API Controllers, self-explanatory, interpret API calls in a fixed-fasion and contain minimum logic

- Validation functions, self-explanatory, contain nothing other than if statements
