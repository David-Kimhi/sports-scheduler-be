import * as ft_config from '../config/football_config/index.js'
import * as bskt_config from '../config/basketball_config/index.js'
import * as nba_config from '../config/nba_config/index.js'

export type Sport = "football" | "basketball" | "nba";

export const uriMap: Record<Sport, string> = {
  football: ft_config.URI,
  basketball: bskt_config.URI,
  nba: nba_config.URI
};

export const API_KEYS: Record<Sport, string> = {
    football: process.env.APIFOOTBALL_API_KEY!,
    basketball: process.env.APIFOOTBALL_API_KEY!,
    nba: process.env.APIFOOTBALL_API_KEY!
  };

export const hostMap: Record<Sport, string> = {
    football: `v3.football.api-sports.io`,
    basketball: `v1.basketball.api-sports.io`,
    nba: `v2.nba.api-sports.io`
}

export const planMap: Record<Sport, string> = {
    football: "PRO",
    basketball: "FREE",
    nba: "FREE"
}