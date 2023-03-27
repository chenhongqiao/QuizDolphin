# Quiz Dolphin


[![DeepScan grade](https://deepscan.io/api/teams/12458/projects/17639/branches/409615/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=12458&pid=17639&bid=409615)

FBLA 2021 Coding and Programming 1st Place National

## Overview

Quiz Dolphin is designed to be a very flexible multi-purpose quiz systems, it can not only be used to host "FBLA-Quiz" as specified by FBLA Event Guideline, but also in many other scenarios such as classroom quiz and competitive event.

This system allows teachers to freely create quizzes and add different types of questions easily. This system also allows students to focus on the questions they are answering by handling all other hassles for them (such as auto progress-saving and non-distractive timer).

This system contains useful analytical functions so teachers can easily see how students did and students can easily see their improvements.

This system stores all the information in the backend and limits user's access to data by verifying their identities on api request. This system only stores user's hashed password to ensure their password's plain text won't be leaked even if our database is tempered (To be specific, bcrypt, a PBKDF algorithm is used to hash the password)

Quiz Dolphin is production ready and can be deployed easily with docker.

## Getting Started

Please refer to [Getting Started](docs/docs/admin/README.md) for program setup instructions.

## Libraries and Templates

Please refer to [Library List](LIBRARY.md) for libraries and permissions.

## Design

This project has two parts, a frontend and a backend. Backend stores and processes data while frontend displays and receives data from user.

### Grading

All grading happens in the backend to prevent tampering. User answers that will be graded are fetched from redis, not accepted from user's grading request. End time check is performed on progress update, grading can happen at anytime, but user can not update their answer once time runs out.

### Data Storage

All persistent data (including users, quizzes, questions, quiz attempts, results) are stored in MongoDB with appropriate index to boost performance. Temporary data such as user quiz progress are stored in Redis for performance reason. Specially, the 50 demo questions (specified by FBLA Guidelines) are stored in a flat json file, and are automatically injected to the database on first-run.

### Data Validation

Data is validated twice through out the workflow. The frontend ensures that the user cannot enter invalid data and notifies them if they do. The backend verifies the data again when constructing object to ensure that no invalid data is write to the database.

### Permission Model

User privileges (roles) are verified in api controllers, if their privileges are insufficient, api controller will refuse their request (401/403) or will ignore some part of their request (ignore viewAll=true).

### Data Isolation

Unless user has admin privileges, when searching for a record, backend always ensure that this record belongs to the user requesting. If they try to request a resource not owned by them, a 404 will be returned.

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

## Commentary

This project contains commentary with the purpose of assisting the reader to understand project logic and design, thus some files do not contain commentary because they are either

- Vue Templates, describes layout rather than logic (like html)

- API Controllers, self-explanatory, interpret API calls in a fixed-fashion and contain minimum logic

- Validation functions, self-explanatory, contain nothing other than if statements
