# green-api-task

## Requirements to run the program:
- RabbitMQ Server
- NodeJS
- Postman (Tool for sending HTTP request)
- Docker

## Sequence of running the program
1. Create RabbitMQ server. Run the following in your terminal to create server: "docker run --name jobtask -p 5672:5672 rabbitmq"
2. Run program M1.js with following command: "npm run m1:dev"
3. Run program M2.js with following command: "npm run m2:dev"
4. POST request to http://localhost:3000/task with body part.