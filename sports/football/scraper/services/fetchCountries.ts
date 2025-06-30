import { fetchSportData } from '../../../../services/apiSportsFetcher.js'
import { downloadImage } from '../../../../helpers.js'
import { wrapperWrite, writeUpsert } from '../../../../mongodb/writers.js'
import { MODULE, SPORT } from '../config.js'
import { Db } from 'mongodb'
import { createLogger } from '../../../../services/logger.js'

const cwd = process.cwd();
const dimention = 'countries';
const logger = createLogger(MODULE, SPORT);

async function fetchAndStoreCountries(db: Db) {
    const wrapperUpsert = wrapperWrite(writeUpsert, db, dimention);

    const countries_source = await fetchSportData(SPORT, dimention)
    const countries_target = [];


    for (const country of countries_source) {
        let imageBuffer: Buffer | null = null;
        let contentType: string | null = null;

        try {
            imageBuffer = await downloadImage(country.flag);
            contentType = 'image/svg+xml';
        } catch (error) {
            logger.warn(`Could not download image for ${country.name}:`, error);
        }

        countries_target.push({
            name: country.name,
            code: country.code,
            flagImage: imageBuffer,      
            flagContentType: contentType
        });
    }

    await wrapperUpsert(countries_target, 'name');

}

export { fetchAndStoreCountries }

