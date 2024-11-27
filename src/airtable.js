import Airtable from 'airtable';

const AIRTABLE_BASE_ID = 'app7m4fcWo5B7gP05';
const AIRTABLE_TABLE_NAME = 'standards';
const AIRTABLE_API_KEY = 'patpiVaHfBRuUyGgC.3078753b045ee3d4d604d998e1f29c3c3b700a5cf3784bf4e4ad0dd27222f1a7';

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

export const fetchAirtableData = async () => {
  try {
    const records = await base(AIRTABLE_TABLE_NAME)
      .select({
        view: 'Grid view', // Adjust view as needed
        expand: ['Type'], // Expand the linked Type field
      })
      .all();

    return records.map((record) => ({
      id: record.id,
      ...record.fields,
      Type: Array.isArray(record.fields.Type)
        ? record.fields.Type.map((type) => (typeof type === 'object' ? type.name : type)).join(', ')
        : record.fields.Type,
    }));
  } catch (error) {
    console.error('Error fetching data from Airtable:', error);
    return [];
  }
};