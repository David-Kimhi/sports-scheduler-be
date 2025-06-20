import { fetchAndStoreCountries } from './sports/football/fetchCountries.js'
import {  fetchAndStoreLeauges } from './sports/football/fetchLeagues.js'
import { fetchAndStoreFixtures } from './sports/football/fetchGames.js';
import { runOnce, resetFlags } from './sports/football/flags.js';

resetFlags();

// Countries
await runOnce("fetchCountries", fetchAndStoreCountries);

// Leagues
await runOnce("fetchLeagues", fetchAndStoreLeauges);

// Fixtures
await runOnce("fetchFixtures", fetchAndStoreFixtures);