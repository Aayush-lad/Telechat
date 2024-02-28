# 🚀 Telechat: Scalable Real-time Chat Application



## Overview

Telechat is an advanced real-time chat application designed to provide users with a seamless communication experience. Built with cutting-edge technologies, Telechat ensures secure messaging, video calls, and efficient data management.

## Features

- 💬 Real-time messaging using Socket.io and Redis Pub/Sub.
- 📡 Scalable event streaming with Kafka.
- 🔒 Secure user authentication powered by Firebase.
- 📹 Video and voice call capabilities via Agora.
- 🖼️ Persistent storage of images using Azure Blob Storage.
- 🛠️ Efficient database management with PostgreSQL and Prisma ORM.
- 🎨 Responsive and aesthetic UI design facilitated by Tailwind CSS.

## Technologies Used
<img src="https://github.com/Aayush-lad/Telechat/assets/126383391/873e303d-0b9a-4829-a579-2fddd3bf031e" width="50px" height="50px">
<img src="https://github.com/Aayush-lad/Telechat/assets/126383391/2e4f4e4c-734e-42b8-bc97-bc9280b20cc6" width="50px" height="50px">
<img src="https://github.com/Aayush-lad/Telechat/assets/126383391/e4e0e4db-7af4-4169-a300-e878f9197add" width="50px" height="50px">
<img src="https://github.com/Aayush-lad/Telechat/assets/126383391/34c057c5-5fc6-4cf4-8bb9-ea8818c97dd2" width="50px" height="50px">
<img src="https://github.com/Aayush-lad/Telechat/assets/126383391/84560087-9226-4773-a142-9270762346c0" width="50px" height="50px">
<img src="https://github.com/Aayush-lad/Telechat/assets/126383391/917d6752-364d-4f93-a1e8-e1113fb42fc3" width="50px" height="50px">
<img src="https://github.com/Aayush-lad/Telechat/assets/126383391/66e1b7a8-0272-4c03-aecb-b5e1c58b4f88" width="50px" height="50px">
<img src="https://github.com/Aayush-lad/Telechat/assets/126383391/fb9cfa0f-7c14-4412-aeeb-8a688c7aa6d3" width="80px" height="50px">
<img src="https://github.com/Aayush-lad/Telechat/assets/126383391/2639b2c7-7685-4c33-8ad9-c27779e723f0" width="50px" height="50px">
<img src="https://github.com/Aayush-lad/Telechat/assets/126383391/e313555e-fd5e-4156-b518-d9bdaebfffe2" width="80px" height="50px">
<img src="https://github.com/Aayush-lad/Telechat/assets/126383391/da5ba41d-2c57-42fe-8147-2f299b95f76a" width="50px" height="50px">
<img src="https://github.com/Aayush-lad/Telechat/assets/126383391/2d160d09-f398-43ff-b502-11104ae9e49d" width="50px" height="50px">
<img src="https://github.com/Aayush-lad/Telechat/assets/126383391/6b0a24e5-eed5-4d8b-905d-329ff42492c6" width="50px" height="50px">

## System Design
![System design telechat drawio](https://github.com/Aayush-lad/Telechat/assets/126383391/065186ac-aeef-4168-a112-173a0cb7ac2f)



## Project description

Telechat operates through a well-orchestrated series of components:

1. **Client-Side Interaction**:
   - Users interact with Telechat through a responsive and dynamic user interface built with Next.js and React.js.
   - The frontend communicates with the backend server via RESTful APIs and WebSocket connections managed by Socket.io.

2. **Backend Logic**:
   - Node.js and Express.js handle the backend logic, including user authentication, message routing, and API endpoints.
   - Socket.io and Redis Pub/Sub ensure real-time communication, enabling instant message delivery and presence management.

3. **Scalable Messaging**:
   - Kafka acts as a distributed streaming platform, facilitating scalable event streaming for message distribution and processing.
   - Messages are published to Kafka topics, allowing multiple consumers to process them independently and efficiently.

4. **Authentication and Security**:
   - Firebase provides secure user authentication, ensuring that user credentials and sessions are managed securely.

5. **Media Handling**:
   - Agora integration enables Telechat to support video and voice calls seamlessly.
   - Azure Blob Storage stores and retrieves images, ensuring persistence and reliability of media content.

6. **Database Management**:
   - PostgreSQL serves as the primary database, storing user profiles, message histories, and other application data.
   - Prisma ORM simplifies database interactions, providing a type-safe and expressive interface for data access and manipulation.

7. **UI Design and Styling**:
   - Tailwind CSS offers a utility-first CSS framework, allowing for rapid UI development and customization.
   - Responsive design principles ensure Telechat is accessible and functional across various devices and screen sizes.

## Installation

To run Telechat locally, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/Aayush-lad/telechat.git
   ```
2. Server Configuration and setup
- install dependencies
```bash
cd server
npm install
```

- create .env file and fill the configuration
```bash
DATABASE_URL
PORT=5000

REDIS_USERNAME=
REDIS_PASSWORD=
REDIS_HOST=
REDIS_PORT=

KAFKA_PASSWORD =
KAFKA_USERNAME =
BROKER=
```
Note : I have used following free tier services
- Aiven Postgresql : https://console.aiven.io/signup?referral_code=giow8sfe8vner4omkb7l
- Redis Labs redis:https://redis.com/
- Confluent kafka: https://confluent.io/get-started/

3. Run the server
```bash
node index.js or npm start
```
4. Client configuration
```bash
cd client
npm install
```
5. Run the client

```bash
npm run dev
```



***Limitations of Live website***

- Website is slow as it is deployed using free tier render and redis free tier(10MB)
- Sometimes during high load kafka might disconnect as it is  free tier and uses shared kafka cluster  ( dont worry your message will be stored  in DB and will appear on reload)
