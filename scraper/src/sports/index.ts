import { fetchAndStoreCountries } from './football/fetchCountries.js'
import {  fetchAndStoreLeauges } from './football/fetchLeagues.js'
import { fetchAndStoreFixtures } from './football/fetchGames.js';
import { runOnce, resetFlags } from './football/flags.js';

resetFlags;

// Countries
await runOnce("fetchCountries", fetchAndStoreCountries);

// Leagues
await runOnce("fetchLeagues", fetchAndStoreLeauges);

// Fixtures
await runOnce("fetchFixtures", fetchAndStoreFixtures);
