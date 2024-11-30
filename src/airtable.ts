import Airtable from 'airtable';

// Updated interface to include related standards
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
  RelatedStandards?: string[]; // Array of Airtable record IDs
  relatedStandardsData?: AirtableRecord[]; // Array of full record data
}

const AIRTABLE_BASE_ID = 'app7m4fcWo5B7gP05';
const AIRTABLE_TABLE_NAME = 'standards';
const AIRTABLE_API_KEY = 'patpiVaHfBRuUyGgC.3078753b045ee3d4d604d998e1f29c3c3b700a5cf3784bf4e4ad0dd27222f1a7';

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

export const fetchAirtableData = async (): Promise<AirtableRecord[]> => {
  try {
    // Fetch all records from Airtable with the specified filter
    const records = await base(AIRTABLE_TABLE_NAME)
      .select({
        view: 'Grid view',
        filterByFormula: '{Status} = "Live"',
      })
      .all();

    // Map basic record data into the AirtableRecord interface
    const mappedRecords: AirtableRecord[] = records.map((record) => ({
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
      RelatedStandards: Array.isArray(record.fields.RelatedStandards)
        ? record.fields.RelatedStandards
        : [],
    }));

    // Add related standards data by resolving related IDs to full records
    const recordsWithRelated: AirtableRecord[] = mappedRecords.map((record) => {
      if (!record.RelatedStandards || record.RelatedStandards.length === 0) {
        return record;
      }

      const relatedStandardsData = record.RelatedStandards.map((relatedId) =>
        mappedRecords.find((r) => r.id === relatedId)
      ).filter((r): r is AirtableRecord => r !== undefined);

      return {
        ...record,
        relatedStandardsData,
      };
    });

    console.log('Mapped records with related standards:', recordsWithRelated); // Debug log
    return recordsWithRelated;
  } catch (error) {
    console.error('Error fetching data from Airtable:', error);
    return [];
  }
};

export const createAirtableRecord = async (formData: Record<string, string | string[]>) => {
  try {
    const createdRecord = await base(AIRTABLE_TABLE_NAME).create([
      {
        fields: formData,
      },
    ]);
    console.log('Record created in Airtable:', createdRecord);
    return createdRecord;
  } catch (error) {
    console.error('Error creating record in Airtable:', error);
    throw error;
  }
};