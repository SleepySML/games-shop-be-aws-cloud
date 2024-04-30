'use strict';
const AWS = require('aws-sdk');
const uuid = require('uuid');

module.exports.catalogBatchProcess = async (event) => {
    const docClient = new AWS.DynamoDB.DocumentClient();
    const sns = new AWS.SNS();
    const records = event.Records;

    console.log('records:', records);

    try {
        await Promise.all(records.map(async record => {
            const items = JSON.parse(record.body);
            const itemTittles = items.map(item => item.title).join(', ');

            try {
                for await (const item of items) {
                    const itemWithId = {
                        ...item,
                        id: uuid.v4()
                    }
                    const params = {
                        TableName: 'products',
                        Item: itemWithId
                    };
                    await docClient.put(params).promise();
                }

                await sns.publish({
                    TopicArn: 'arn:aws:sns:eu-west-1:216263405757:createProductTopic',
                    Message: `Products was created: ${itemTittles}`,
                    Subject: 'New Products',
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
