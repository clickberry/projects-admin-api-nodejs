# Dockerized Projects API
Projects micro-service on Node.js. This a micro-service for link together videos, screenshots, images, metadata and etc.

* [Architecture](#architecture)
* [Technologies](#technologies)
* [Environment Variables](#environment-variables)
* [Events](#events)
* [API](#api)
* [License](#license)

# Architecture
The application is a REST API service with database and messaging service (Bus) dependencies.

# Technologies
* Node.js
* MongoDB/Mongoose
* Express.js
* Passport.js
* Official nsqjs driver for NSQ messaging service

# Environment Variables
The service should be properly configured with following environment variables.

Key | Value | Description
:-- | :-- | :-- 
MONGODB_CONNECTION | mongodb://mongo_host:mongo_port/projects | MongoDB connection string.
TOKEN_ACCESSSECRET | MDdDRDhBOD*** | Access token secret.
NSQD_ADDRESS | bus.yourdomain.com | A hostname or an IP address of the NSQD running instance.
NSQD_PORT | 4150 | A TCP port number of the NSQD running instance to publish events.

# Events
The service generates events to the Bus (messaging service) in response to API requests.

## Send events
Topic | Message | Description
:-- | :-- | :--
project-deletes | {projectId: *projectId*} | Project ID.

# API
## DTO
### Project Dto
| Param   | Description |
|----------|-------------|
| id     | Project ID.|
| userId     | Owner user ID|
| name     | Name of project|
| description     | Description of project|
| created     | Date of create project|
| videos     | List of [Encoded videos](#encodeded-video-dto)|
| imageUri | Uri of image |
| isPrivate| Private state - true/false |
| isHidden| Hidden state - true/false |
| relationToken| JWT with {id: *entity ID*, ownerId: *user ID of entity owner*}|

### Encodeded Video Dto
| Param   | Description |
|----------|-------------|
| contentType     | Content type such as *video/mp4* or *video/webm*|
| uri     | Uri of encoding video|
| width     | Width of video frame|
| height     | Height of video frame |
| sign     | Uri signature. **Only for Request**|

## GET /?**{params}**
Gets all public projects from all users.

### Request
#### Header
| Param   | Value |
|----------|-------------|
| Authorization     | "JWT [accessToken]" with admin role|

### Query Param
**{params}** - restricted version of OData protocol with one level brackets '(' ')' support. ([OData documentation](http://docs.oasis-open.org/odata/odata/v4.0/odata-v4.0-part2-url-conventions.html)).

| Param    | Description | Allowed Values| Example | 
|----------|-------------|---------------|---------|
| $filter    |  Filtering | *fields:* name, created, isPrivate, isHidden | $filter=created gte '2016-01-26T15:42:19Z' and (name ge 'b' or name eq 'abc') |
| $orderby    |  Sorting | *fields:* name, created | $orderby=created asc,name desc|
| $top    | Quantity return entities. | 0 < $top <= 100 | $top=30 |
| $skip    | Quantity skip entities. | 0 < $skip <= 100 | $skip=60 |

### Response
| HTTP       |      Value                                                         |
|------------|--------------------------------------------------------------------|
| StatusCode | 200                                                            |
| Body | List of [Project Dto](#project-dto)                                                            |

## DELETE /:projectId
Removes user project by id.

### Request
#### Header
| Param   | Value |
|----------|-------------|
| Authorization     | "JWT [accessToken]" with admin role|

### Response
| HTTP       |      Value                                                         |
|------------|--------------------------------------------------------------------|
| StatusCode | 200                                                            |

# License
Source code is under GNU GPL v3 [license](LICENSE).
