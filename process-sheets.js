const supabase = require("./db/init");
const sheets = require("./utils/sheets")

const processSheetFromDB = async (last_stored_id) => {
    const resp = await supabase.from("Demands").select("*").gt('id', last_stored_id);
    const data = resp['data'];
    new_data = data.map((item) => {
        return [item['id'], item['content'], item['name'], item['patient_age'], item['contact_number'], item['location'],
        item['oxygen_level'], item['source_id'], item['status'], item['source'], item['hospital'], item['datetime'], item['help_needed']]
    })
    console.log(new_data);
    sheets.updateSheet(sheets.jwt, new_data);
}

processSheetFromDB();

