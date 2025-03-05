import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

//@ts-ignore
import {UUID} from "/opt/node_modules/bson";
// @ts-ignore
import { connectToDocumentDB } from '/opt/utils/db'; // From Lambda Layer
//@ts-ignore
import Respond from "/opt/utils/respond";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const client = await connectToDocumentDB();
    const db = client.db('concerts');
    const collection = db.collection('concerts');

    const { id } = event.pathParameters || {};

    // Fetch concert(s)
const result = id
    ? await collection.findOne({ _id: new UUID(id).toBinary() })
    : await collection.find({}).toArray();

    await client.close();
    if (!result && id) return Respond.NOT_FOUND('Concert not found');
    return Respond.OK('Concerts fetched', result);
};