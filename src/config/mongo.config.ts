export const USERNAME = encodeURIComponent(process.env.DB_USERNAME!);
export const PASSWORD = encodeURIComponent(process.env.DB_PASSWORD!);
export const CLUSTER = 'cluster0.raxoh.mongodb.net';
export const OPTIONS = '?retryWrites=true&w=majority&appName=Cluster0';

export const GAMES_COLL_NAME = 'fixtures' as const;
export const LEAGUES_COLL_NAME = 'leagues' as const;
export const COUNTRIES_COLL_NAME = 'countries' as const;
export const TEAMS_COLL_NAME = 'teams' as const;