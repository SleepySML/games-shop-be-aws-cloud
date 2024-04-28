'use strict';
const AWS = require('aws-sdk');

module.exports.catalogBatchProcess = async (event) => {
    const docClient = new AWS.DynamoDB.DocumentClient();
    const sns = new AWS.SNS();
    const topicData = await sns.createTopic({ Name: 'createProductTopic' }).promise();
    const records = event.Records;

    try {
        await Promise.all(records.map(async record => {
            const item = JSON.parse(record.body);
            const params = {
                TableName: 'products',
                Item: item
            };
            try {
                await docClient.put(params).promise();
                console.log(`The product "${item.title}" was inserted.`);

                await sns.publish({
                    Subject: 'New Product Created',
                    Message: `A new product was created: ${JSON.stringify(item)}`,
                    TopicArn: topicData.TopicArn,
                    Endpoint: "evgenij.sleepy@gmail.com"
                }).promise();

            } catch (err) {
                console.error('Error inserting the product:', err);
            }
        }));

        return {
            statusCode: 200,
            body: JSON.stringify({message: 'All products were inserted.'})
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({message: 'Error inserting the products.'})
        };
    }
};
