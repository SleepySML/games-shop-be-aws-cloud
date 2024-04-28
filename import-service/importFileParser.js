'use strict';
const AWS = require('aws-sdk');
const csv = require('csv-parser');


module.exports.importFileParser = async (event) => {
    const bucket = 'games-shop-aws-learning-uploads';
    const sqs = new AWS.SQS();
    const sns = new AWS.SNS();

    try {
        const s3 = new AWS.S3({ region: 'eu-west-1' });
        const s3Stream = s3.getObject({
            Bucket: bucket,
            Key: event.Records[0].s3.object.key
        }).createReadStream();

        const queueUrl = await sqs.getQueueUrl({
            QueueName: 'catalogItemsQueue'
        }).promise();

        s3Stream.pipe(csv())
            .on('data', async (data) => {
                await sqs.sendMessage({
                    QueueUrl: queueUrl.QueueUrl,
                    MessageBody: JSON.stringify(data),
                }).promise();
            })
            .on('end', async () => {
                const snsData = await sns.publish({
                    TopicArn: 'createProductTopic',
                    Message: `Products were created`,
                    Subject: 'New Products',
                }).promise();

                console.log("SNS message sent, messageId:", snsData.MessageId);
                console.log(`Successfully processed ${event.Records[0].s3.object.key}`);
            })
            .on('error', (error) =>
                console.error(`Error processing ${event.Records[0].s3.object.key}: `, error)
            );
    } catch (error) {
        console.error('Error occurred while parsing file:', error);
    }
};
