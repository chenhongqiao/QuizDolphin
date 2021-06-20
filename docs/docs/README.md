# Quiz Dolphin

FBLA 2021 Coding and Programming California Champion

## Overview

Quiz Dolphin is designed to be a very flexible multi-purpose quiz systems, it can not only be used to host "FBLA-Quiz" as specified by FBLA Event Guideline, but also in many other scenarios such as classroom quiz and competitive event.

This system allows teachers to freely create quizzes and add different types of questions easily. This system also allows students to focus on the questions they are answering by handling all other hassles for them (such as auto progress-saving and non-distractive timer).

This system contains useful analytical functions so teachers can easily see how students did and students can easily see their improvements.

This system stores all the information in the backend and limits user's access to data by verifying their identities on api request. This system only stores user's hashed password to ensure their password's plain text won't be leaked even if our database is tempered (To be specific, bcrypt, a PBKDF algorithm is used to hash the password)

Quiz Dolphin is production ready and can be deployed easily with docker.

## Getting Started

Please refer to [Getting Started](admin/README.md) for program setup instructions.

Please refer to [Getting Started](user/README.md) for program usage documentation for users.
