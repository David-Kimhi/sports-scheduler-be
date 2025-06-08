import { fetchSportData } from '../../apiFetcher.js'
import { downloadImage } from '../../utils.js'
import { wrapperWrite, writeUpsert } from '../../../../mongodb/writers.js'


const sport = 'football'
const dimention = 'countries'

const wrapperUpsert = wrapperWrite(writeUpsert, sport, dimention);


async function fetchAndStoreCountries() {
    const countries_source = await fetchSportData(sport, dimention)
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

