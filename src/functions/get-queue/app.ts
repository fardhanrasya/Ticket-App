import { SQSEvent } from 'aws-lambda';
// @ts-ignore
import { connectToDocumentDB } from '/opt/utils/db'; // From Lambda Layer
// @ts-ignore
import {UUID} from "bson";

export const handler = async (event: SQSEvent): Promise<void> => {
    const client = await connectToDocumentDB();
    const db = client.db('concerts');
    const concertsCollection = db.collection('concerts');
    const transactionsCollection = db.collection('transactions');

    for (const record of event.Records) {
        const { concertId, userId } = JSON.parse(record.body);

        const session = client.startSession();
        try {
            await session.withTransaction(async () => {
                // Check stock
                const concert:ConcertTypes = await concertsCollection.findOne({ _id: new UUID(concertId).toBinary() });
                if (!concert || concert.availableTickets <= 0) {
                    await transactionsCollection.insertOne({
                        concertId,
                        userId,
                        status: 'FAILED',
                        timestamp: new Date().getTime()
                    });
                    return;
                }

                // Decrement stock
                await concertsCollection.updateOne(
                    { _id: new UUID(concertId).toBinary() },
                    { $inc: { availableTickets: -1 } },
                    { session }
                );

                // Record transaction
                await transactionsCollection.insertOne({
                    concertId,
                    userId,
                    status: 'SUCCESS',
                    timestamp: new Date().getTime()
                }, { session });
            });
            await session.commitTransaction()
        } catch (err){
            console.error('Error:', err);
            await session.abortTransaction();
        }finally {
            await session.endSession();
            await client.close();
        }
    }
};