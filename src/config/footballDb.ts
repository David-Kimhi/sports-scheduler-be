export const USERNAME = encodeURIComponent(process.env.DB_USERNAME!);
export const PASSWORD = encodeURIComponent(process.env.DB_PASSWORD!);
export const CLUSTER = 'cluster1.jjaidiu.mongodb.net';
export const OPTIONS = '?retryWrites=true&w=majority&appName=Cluster1';

export const DEFAULT_DB_NAME = 'football';

export const URI = `mongodb+srv://${USERNAME}:${PASSWORD}@${CLUSTER}/${DEFAULT_DB_NAME}${OPTIONS}`;

export const GAMES_COLL_NAME = 'fixtures' as const;
export const LEAGUES_COLL_NAME = 'leagues' as const;
export const COUNTRIES_COLL_NAME = 'countries' as const;
export const TEAMS_COLL_NAME = 'teams' as const;
