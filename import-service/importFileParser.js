'use strict';
const AWS = require('aws-sdk');
const csv = require('csv-parser');


module.exports.importFileParser = async (event, context) => {
    const bucket = 'games-shop-aws-learning-uploads';
    try {
        const s3 = new AWS.S3({ region: 'eu-west-1' });
        const s3Stream = s3.getObject({
            Bucket: bucket,
            Key: event.Records[0].s3.object.key
        }).createReadStream();

        s3Stream.pipe(csv())
            .on('data', (data) => console.log(data))
            .on('end', async () => {
                console.log(`Successfully processed ${record.s3.object.key}`);
            })
            .on('error', (error) =>
                console.error(`Error processing ${record.s3.object.key}: `, error)
            );

    } catch (error) {
        console.error('Error occurred while parsing file:', error);
    }
};
