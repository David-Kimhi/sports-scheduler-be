export const USERNAME = encodeURIComponent(process.env.DB_USERNAME!);
export const PASSWORD = encodeURIComponent(process.env.DB_PASSWORD!);
export const CLUSTER = 'cluster0.raxoh.mongodb.net';
export const OPTIONS = '?retryWrites=true&w=majority&appName=Cluster0';

export const DEFAULT_DB_NAME = 'football';

export const URI = `mongodb+srv://${USERNAME}:${PASSWORD}@${CLUSTER}/${DEFAULT_DB_NAME}${OPTIONS}`;

export const GAMES_COLL_NAME = 'fixtures'
export const LEAGUES_COLL_NAME = 'leagues'
export const COUNTRIES_COLL_NAME = 'countries'
export const TEAMS_COLL_NAME = 'teams'
