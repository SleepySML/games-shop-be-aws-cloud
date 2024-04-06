'use strict';
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.getProductsList = async () => {

    const paramsProducts = {
        TableName: process.env.DYNAMODB_TABLE_PRODUCTS,
    };

    const paramsStock = {
        TableName: process.env.DYNAMODB_TABLE_STOCKS,
    };

    try {
        const productsData = await dynamodb.scan(paramsProducts).promise();
        const stocksData = await dynamodb.scan(paramsStock).promise();

        // join products and stocks
        const productList = productsData.Items.map(item => {
            let stockItem = stocksData.Items.find(stock => stock.product_id === item.id);
            return { ...item, count: stockItem ? stockItem.count : 0};
        });

        return {
            statusCode: 200,
            body: JSON.stringify(productList),
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
