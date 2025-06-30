import { createLogger} from "../../../services/logger";
import * as upstream_config from '../config.js'

export const MODULE = "API"
export const logger = createLogger(MODULE, upstream_config.SPORT);

export const SMALL_L = 10
export const LARGE_L = 100