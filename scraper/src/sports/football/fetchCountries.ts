import { fetchSportData } from '../../apiFetcher.js'
import { downloadImage } from '../../utils.js'
import { wrapperWrite, writeUpsert } from '../../../../mongodb/writers.js'
import { API_SOURCE, SPORT } from './config.js'
import { Db } from 'mongodb'

const dimention = 'countries'

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
        console.warn(`Could not download image for ${country.name}:`, error);
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

