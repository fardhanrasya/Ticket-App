import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {DynamoDBClient, PutItemCommand} from "@aws-sdk/client-dynamodb";
import {marshall} from "@aws-sdk/util-dynamodb";
// @ts-ignore
import Respond from "/opt/utils/respond";

const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION });

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try{
       const body = JSON.parse(event.body || '{}');
         const userId = body.userId;
         await dynamodb.send(new PutItemCommand({
                TableName: process.env.DYNAMODB_TABLE,
                Item: marshall({ userId }) // <-- Use marshall
         }))
        return Respond.CREATED("userId Created",{userId: userId});
    } catch (error){
        console.error('Error:', error);
        return Respond.INTERNAL_ERR("Internal Server Error");
    }
}