import { Country } from "./Country.js";
import { SPORT, COUNTRIES_COLL_NAME } from "../scraper/src/sports/football/config.js";
import { closeMongoDb } from "../mongodb/helpers.js";

await Country.init(SPORT, COUNTRIES_COLL_NAME);
const results = await Country.findByName('england');
console.log(results);

// import { fetchSportData } from "../apiFetcher.js";

await closeMongoDb(SPORT, 'api')

// const params = {country: "england"}
// console.log(await fetchSportData(SPORT, 'teams', params))