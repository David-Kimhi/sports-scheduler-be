import { createLogger} from "../../../services/logger";
import * as upstream_config from '../config.js'

export const MODULE = "API"
export const logger = createLogger(MODULE, upstream_config.SPORT);