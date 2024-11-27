import Airtable from 'airtable';

const AIRTABLE_BASE_ID = 'app7m4fcWo5B7gP05';
const AIRTABLE_TABLE_NAME = 'standards';
const AIRTABLE_API_KEY = 'patpiVaHfBRuUyGgC.3078753b045ee3d4d604d998e1f29c3c3b700a5cf3784bf4e4ad0dd27222f1a7';

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

export const fetchAirtableData = async () => {
  try {
    const records = await base(AIRTABLE_TABLE_NAME).select({ view: 'Grid view' }).all();

    return records.map((record) => ({
      id: record.id,
      Title: typeof record.fields.Title === 'string' ? record.fields.Title : '',
      Quicktake: typeof record.fields.Quicktake === 'string' ? record.fields.Quicktake : '',
      Details: typeof record.fields.Details === 'string' ? record.fields.Details : '',
      Price: typeof record.fields.Price === 'number' ? record.fields.Price : 0, // Keep as number
      ImageURL: typeof record.fields.ImageURL === 'string' ? record.fields.ImageURL : '',
      Type: Array.isArray(record.fields.Type)
        ? record.fields.Type.join(', ') // Join arrays into a string
        : typeof record.fields.Type === 'string'
        ? record.fields.Type
        : '',
    }));
  } catch (error) {
    console.error('Error fetching data from Airtable:', error);
    return [];
  }
};