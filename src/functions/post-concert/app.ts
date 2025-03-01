import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
//@ts-ignore
import Respond from "/opt/utils/respond";
//@ts-ignore
import {connectToDocumentDB} from "/opt/utils/db";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try{
        const client = await connectToDocumentDB();
        const db = client.db('concerts');
        const concertsCollection = db.collection('concerts');

        const { artist,
            venue,
            date,
            price,
            availableTickets,
            name,
            imgUrl,
            description } = JSON.parse(event.body || '{}')

        const res = await concertsCollection.insertOne({
            artist,
            venue,
            date,
            price,
            availableTickets,
            name,
            imgUrl,
            description
        })
        await client.close();

        const concert = {
            artist,
            venue,
            date,
            price,
            availableTickets,
            name,
            imgUrl,
            description,
            _id: res.insertedId
        }
        return Respond.CREATED("Concert Created",concert);
    } catch (error){
        return Respond.INTERNAL_ERR("Internal Server Error");
    }
}