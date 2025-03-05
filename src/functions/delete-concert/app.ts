
import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";

//@ts-ignore
import {UUID} from "/opt/node_modules/bson";
//@ts-ignore
import Respond from "/opt/utils/respond";
//@ts-ignore
import {connectToDocumentDB} from "/opt/utils/db";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try{
        const client = await  connectToDocumentDB();
        const db = client.db('concerts');
        const concertsCollection = db.collection('concerts');

        const { id } = event.pathParameters || {};
        await concertsCollection.deleteOne({ _id: new UUID(id).toBinary() });
        return Respond.OK("Concert deleted");
    } catch (error){
        console.error('Error:', error);
        return Respond.INTERNAL_ERR("Internal Server Error");
    }
}
