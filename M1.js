const amqp = require("amqplib/callback_api");
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/task", (req, res) => {
    const task = req.body;
    console.log(`Received task ${JSON.stringify(task)} from HTTP in M1`);
    const correlationId = uuidv4();
    amqp.connect("amqp://localhost:5672", (err, connection) => {
        if (err) throw err;
        connection.createChannel((err, channel) => {
            if (err) throw err;
            channel.assertQueue("", { exclusive: true }, (err, q) => {
                if (err) throw err;
                console.log(`RabbitMQ queue asserted successfully`);
                channel.consume(
                    q.queue,
                    (msg) => {
                        if (msg.properties.correlationId === correlationId) {
                            res.send(msg.content.toString());
                            setTimeout(() => {
                                connection.close();
                            }, 500);
                        }
                    },
                    { noAck: true }
                );
                channel.sendToQueue(
                    "task_queue",
                    Buffer.from(JSON.stringify(task)),
                    { correlationId, replyTo: q.queue }
                );

                console.log(
                    `Task ${JSON.stringify(task)} sent to RabbitMQ queue`
                );
            });
        });
    });
});

app.listen(port, () => {
    console.log(`M1 listening at http://localhost:${port}`);
});
