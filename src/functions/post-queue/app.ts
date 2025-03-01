import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
// @ts-ignore
import { SQSClient, SendMessageCommand } from '/opt/node_modules/@aws-sdk/client-sqs';

const sqs = new SQSClient({ region: process.env.AWS_REGION });
const QueueUrl = process.env.QUEUE_URL!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const { concertId, userId } = JSON.parse(event.body || '{}');

    await sqs.send(new SendMessageCommand({
        QueueUrl,
        MessageBody: JSON.stringify({ concertId, userId }),
        MessageGroupId: concertId // FIFO deduplication
    }));

    return { statusCode: 200, body: 'Ticket request queued' };
};