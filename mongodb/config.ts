import dotenv from 'dotenv';

/**
 * MongoDB URI
 */
export const USERNAME = encodeURIComponent(process.env.DB_USERNAME!);
export const PASSWORD = encodeURIComponent(process.env.DB_PASSWORD!);
export const CLUSTER = 'cluster0.raxoh.mongodb.net';
export const OPTIONS = '?retryWrites=true&w=majority&appName=Cluster0';

export const URI = `mongodb+srv://${USERNAME}:${PASSWORD}@${CLUSTER}/${OPTIONS}`;

export const MODULE = 'MongoDB'