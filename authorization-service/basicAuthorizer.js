'use strict';

module.exports.basicAuthorizer = async (event, _, cb) => {
    console.log('Event:', JSON.stringify(event));

    if (event.type !== 'TOKEN') {
        cb('Unauthorized')
    }

    try {
        const encodedCreds = event.authorizationToken.split(' ')[1];
        const buff = Buffer.from(encodedCreds, 'base64');
        const plainCreds = buff.toString('utf-8').split(':');

        const username = plainCreds[0];
        const password = plainCreds[1];

        console.log(`username: ${username} and password: ${password}`);

        const storedUserName = process.env[username];
        const storedUserPassword = process.env[username];
        const effect = !storedUserName || storedUserPassword !== password ? 'Deny' : 'Allow';

        const policy = generatePolicy(encodedCreds, effect, event.methodArn)

        console.log('Policy:', JSON.stringify(policy));

        cb(null, policy);
    } catch (error) {
        console.error('Error:', error);
        cb('Unauthorized', error.message);
    }
};

function generatePolicy(principalId, effect = 'Allow', resource) {
    return {
        principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: effect,
                    Resource: resource
                }
            ]
        }
    };
}
