'use strict';
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.createProduct = async (event, context) => {
    const body = JSON.parse(event.body);
    const params = {
        TableName: process.env.DYNAMODB_TABLE_PRODUCTS,
        Item: {
            id: body.id,
            title: body.title,
            description: body.description,
            price: body.price,
        }
    };

    try {
        await dynamodb.put(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Product created successfully" }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal Server Error",
                error: error.message,
            }),
        };
    }
};
