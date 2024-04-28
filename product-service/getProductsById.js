'use strict';
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.getProductsById = async (event) => {
    const paramsProducts = {
        TableName: process.env.DYNAMODB_TABLE_PRODUCTS,
        Key: {
            id: event.pathParameters.productId,
        },
    };

    try {
        const data = await dynamodb.get(paramsProducts).promise();
        const item = data.Item;

        return item ? {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify(item),
        } : {
            statusCode: 404,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ message: 'Product not found' }),
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                message: "Internal Server Error",
                error: error.message,
            }),
        };
    }
};
