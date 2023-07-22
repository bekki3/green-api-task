const amqp = require("amqplib/callback_api");

amqp.connect("amqp://localhost:5672", (err, connection) => {
    if (err) throw err;
    connection.createChannel((err, channel) => {
        if (err) throw err;
        channel.assertQueue("task_queue", { durable: true }, (err) => {
            if(err){
                console.error(err);
                return;
            }

            console.log(`RabbitMQ queue asserted successfully`);
        });
        channel.prefetch(1);
        console.log(`Waiting for messages in task_queue`);
        channel.consume(
            "task_queue",
            (msg) => {
                const task = JSON.parse(msg.content.toString());
                let result = "No result";
                
                // Process the task here
                const { type, number } = task;
                if(type == "is-even-number"){
                    if (parseInt(number) % 2 === 0) {
                        result = "Even";
                    } else {
                        result = "Odd";
                    }
                }

                console.log(`Task processed successfully, result returned: ${result}`);

                channel.sendToQueue(msg.properties.replyTo, Buffer.from(result), {
                    correlationId: msg.properties.correlationId,
                });
                channel.ack(msg);
            },
            { noAck: false }
        );
    });
});
