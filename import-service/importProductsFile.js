'use strict';
const AWS = require('aws-sdk');

module.exports.importProductsFile = async (event, context) => {
    const bucket = 'games-shop-aws-learning-uploads';
    const S3 = new AWS.S3({ region: 'eu-west-1' });
    const fileName = event.queryStringParameters.name;
    const s3Params = {
        Bucket: bucket,
        Key: `uploaded/${fileName}`,
        Expires: 60,
        ContentType: 'text/csv'
    };

    try {
        const signedUrl = await S3.getSignedUrl('putObject', s3Params);
        return {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            statusCode: 200,
            body: signedUrl
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
