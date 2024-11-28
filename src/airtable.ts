import Airtable from 'airtable';

export interface AirtableRecord {
  id: string;
  Title: string;
  Standard: string;
  Type_Text: string[];
  Quicktake: string;
  Details: string;
  Price: string;
  ImageURL: string;
  BuyURL: string;
  SustainabilityNotes: string;
}

const AIRTABLE_BASE_ID = 'app7m4fcWo5B7gP05';
const AIRTABLE_TABLE_NAME = 'standards';
const AIRTABLE_API_KEY = 'patpiVaHfBRuUyGgC.3078753b045ee3d4d604d998e1f29c3c3b700a5cf3784bf4e4ad0dd27222f1a7';
const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);


export const fetchAirtableData = async (): Promise<AirtableRecord[]> => {
  try {
    const records = await base(AIRTABLE_TABLE_NAME)
      .select({
        view: 'Grid view',
        filterByFormula: '{Status} = "Live"',
      })
      .all();
    
    const mappedRecords = records.map((record) => {
      const mappedRecord = {
        id: record.id,
        Title: typeof record.fields.Title === 'string' ? record.fields.Title : '',
        Standard: typeof record.fields.Standard === 'string' ? record.fields.Standard : '',
        Type_Text: Array.isArray(record.fields.Type_Text) ? record.fields.Type_Text : [],
        Quicktake: typeof record.fields.Quicktake === 'string' ? record.fields.Quicktake : '',
        Details: typeof record.fields.Details === 'string' ? record.fields.Details : '',
        Price: typeof record.fields.Price === 'string' ? record.fields.Price : '',
        ImageURL: typeof record.fields.ImageURL === 'string' ? record.fields.ImageURL : '',
        BuyURL: typeof record.fields.BuyURL === 'string' ? record.fields.BuyURL : '',
        SustainabilityNotes: typeof record.fields.SustainabilityNotes === 'string'
          ? record.fields.SustainabilityNotes
          : '',
      };
      console.log('Mapped record Type_Text:', mappedRecord.Type_Text); // Debug log
      return mappedRecord;
    });

    return mappedRecords;
  } catch (error) {
    console.error('Error fetching data from Airtable:', error);
    return [];
  }
};