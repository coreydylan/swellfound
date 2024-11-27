import Airtable, { FieldSet, Records } from 'airtable';

const AIRTABLE_BASE_ID = 'app7m4fcWo5B7gP05';
const AIRTABLE_TABLE_NAME = 'standards';
const AIRTABLE_API_KEY = 'patpiVaHfBRuUyGgC.3078753b045ee3d4d604d998e1f29c3c3b700a5cf3784bf4e4ad0dd27222f1a7';

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

export const fetchAirtableData = async () => {
  try {
    const records: Records<FieldSet> = await base(AIRTABLE_TABLE_NAME)
      .select({
        view: 'Grid view',
      })
      .all();

    return records.map((record) => ({
      id: record.id,
      Title: record.fields.Title || undefined,
      Quicktake: record.fields.Quicktake || undefined,
      Details: record.fields.Details || undefined,
      Price: record.fields.Price || undefined,
      ImageURL: record.fields.ImageURL || undefined,
      Type: Array.isArray(record.fields.Type)
        ? record.fields.Type.map((type) =>
            typeof type === 'object' && type !== null ? type.name : String(type)
          ).join(', ')
        : typeof record.fields.Type === 'string'
        ? record.fields.Type
        : undefined,
    }));
  } catch (error) {
    console.error('Error fetching data from Airtable:', error);
    return [];
  }
};