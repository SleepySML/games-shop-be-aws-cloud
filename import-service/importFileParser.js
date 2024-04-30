'use strict';
const AWS = require('aws-sdk');
const csv = require('csv-parser');


module.exports.importFileParser = async (event) => {
    const bucket = 'games-shop-aws-learning-uploads';
    const sqs = new AWS.SQS();
    const s3 = new AWS.S3({ region: 'eu-west-1' });

    try {
        const queueUrl = await sqs.getQueueUrl({
            QueueName: 'catalogItemsQueue'
        }).promise();

        for await(const record of event.Records) {
            const s3Stream = s3.getObject({
                Bucket: bucket,
                Key: record.s3.object.key,
            }).createReadStream();

            const csvStream = s3Stream.pipe(csv());

            const products = [];

            for await (const line of streamToAsyncIterable(csvStream)) {
                products.push(line);
            }

            await sqs.sendMessage({
                QueueUrl: queueUrl.QueueUrl,
                MessageBody: JSON.stringify(products),
            }).promise();

            await s3.copyObject({
                Bucket: record.s3.bucket.name,
                CopySource: `${record.s3.bucket.name}/${record.s3.object.key}`,
                Key: record.s3.object.key.replace('uploaded', 'parsed'),
            }).promise();

            await s3.deleteObject({
                Bucket: record.s3.bucket.name,
                Key: record.s3.object.key,
            }).promise();
        }
    } catch (e) {
        console.error('importFileParser error:', e);
    }
};

function streamToAsyncIterable(stream) {
    const reader = stream[Symbol.asyncIterator] || stream[Symbol.iterator];
    return {
        [Symbol.asyncIterator]: reader.bind(stream)
    };
}
