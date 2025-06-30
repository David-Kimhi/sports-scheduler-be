import { Country } from "./db/Country.js";
import { SPORT, COUNTRIES_COLL_NAME } from './config.js'
import { closeMongoDb } from "../../mongodb/helpers.js";

Country.collection = await Country.initCollection(SPORT, COUNTRIES_COLL_NAME);
const results = await Country.findByName('england');
console.log(results);

// import { fetchSportData } from "../apiFetcher.js";

await closeMongoDb(SPORT, 'api')

// const params = {country: "england"}
// console.log(await fetchSportData(SPORT, 'teams', params))
console.log(process.cwd())