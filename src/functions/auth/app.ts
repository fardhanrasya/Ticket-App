import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
// @ts-ignore
import { verifyToken } from '/opt/utils/auth'; // From Lambda Layer

export const handler = async (
    event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
    try {
        const token = event.authorizationToken.replace('Bearer ', '');
        const decoded = verifyToken(token);

        return {
            principalId: decoded.userId,
            policyDocument: {
                Version: '2012-10-17',
                Statement: [{
                    Action: 'execute-api:Invoke',
                    Effect: 'Allow',
                    Resource: event.methodArn
                }]
            }
        };
    } catch (error) {
        return {
            principalId: 'unauthorized',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [{
                    Action: 'execute-api:Invoke',
                    Effect: 'Deny',
                    Resource: event.methodArn
                }]
            }
        };
    }
};