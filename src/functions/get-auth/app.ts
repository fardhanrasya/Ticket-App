import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
// @ts-ignore
import { DynamoDBClient, GetItemCommand } from '/opt/node_modules/@aws-sdk/client-dynamodb';
// @ts-ignore
import { marshall } from '/opt/node_modules/@aws-sdk/util-dynamodb';
// @ts-ignore
import { generateToken } from '/opt/utils/auth';
//@ts-ignore
import Respond from "/opt/utils/respond";

const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION });

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const body = JSON.parse(event.body || '{}');
        const userId = body.userId;

        // Validate userId
        if (!userId || typeof userId !== 'string') {
            return { statusCode: 400, body: 'Invalid userId' };
        }

        // Fetch user from DynamoDB
        const { Item } = await dynamodb.send(new GetItemCommand({
            TableName: process.env.DYNAMODB_TABLE,
            Key: marshall({ userId }) // <-- Use marshall
        }));

        if (!Item) {
            return { statusCode: 401, body: 'Unauthorized' };
        }

        // Generate token
        const token = generateToken(userId);
        return Respond.OK('Token generated', { token });

    } catch (error) {
        console.error('Error:', error);
        return Respond.INTERNAL_ERR('Internal Server Error');
    }
};