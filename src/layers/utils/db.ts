import { MongoClient } from 'mongodb';
import {SecretsManagerClient, GetSecretValueCommand} from "@aws-sdk/client-secrets-manager";
import {UUID} from 'bson';

interface MongoSecret {
    MasterUsername: string;
    MasterUserPassword: string;
}
export const connectToDocumentDB = async () => {
    const secretsManager = new SecretsManagerClient({ region: process.env.AWS_REGION });
    const { SecretString } = await secretsManager.send(new GetSecretValueCommand({ SecretId: process.env.DOCUMENTDB_SECRET }));
    const secret = JSON.parse(SecretString || '') as MongoSecret;
    const client = new MongoClient(`mongodb://${secret.MasterUsername}:${secret.MasterUserPassword}@${process.env.DocumentDBClusterEndpoint}:27017/concerts?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`, {
        tlsCAFile: process.env.DOCUMENTDB_CERT,
        pkFactory: {createPk: () => {return new UUID().toBinary()}
        }
    });
    await client.connect();
    return client;
};