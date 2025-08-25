import { USERNAME, PASSWORD, CLUSTER, OPTIONS } from "../index.js";

export const SPORT = 'nba';

export const URI = `mongodb+srv://${USERNAME}:${PASSWORD}@${CLUSTER}/${SPORT}${OPTIONS}`;


