import { Db } from 'mongodb';
import { LEAGUES_COLL_NAME, SCRAPER_MODULE, SPORT, TEAMS_COLL_NAME } from '../config/index.js';
import { createLogger } from '../services/logger.service.js';

const logger = createLogger(SCRAPER_MODULE, SPORT)

/**
 * Updates the leagues collection to embed teams for each season.
 * 
 * For each league:
 *  - For every season (each has `year`, `start`, `end`),
 *  - Fetch all teams from `teams` collection where:
 *      team.league == league.id AND team.season == season.year,
 *  - Update that season object to include a `teams` array.
 */
export async function populateLeagueTeams(db: Db) {
  const leaguesCol = db.collection(LEAGUES_COLL_NAME);
  const teamsCol = db.collection(TEAMS_COLL_NAME);

  logger.info("Populating teams started")

  const leaguesCursor = leaguesCol.find({});
  while (await leaguesCursor.hasNext()) {

    const league = await leaguesCursor.next();
    if (!league || !league.seasons) continue;

    const updatedSeasons = [];
    for (const season of league.seasons) {

        // Fetch all teams for this league and season
        const teams = await teamsCol
            .find({ 'team.league': league.league.id, 'team.season': season.year })
            .project({ _id: 1, 'team.id': 1, "team.name": 1, "team.country": 1}) 
            .toArray();

              
        updatedSeasons.push({
            ...season,
            teams: teams.map(t => ({
                _id: t._id,
                id: t.team.id,
                name: t.team?.name,
                country: t.team?.country
              }))
        });
    }

    // Update the league's seasons array with the new `teams` field
    await leaguesCol.updateOne(
      { _id: league._id },
      { $set: { seasons: updatedSeasons } }
    );
  }

  logger.info('✅ Populated leagues with teams per season');
}
