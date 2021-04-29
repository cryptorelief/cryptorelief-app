const supabase = require("./db/init");
const sheets = require("./utils/sheets")

class ResourceRequest {
// id: String,
// name: String,
// patient_age: Number,
// contact_number: String,
// location: String,
// city: String,
// pincode: Number,
// oxygen_level: Number,
// hospital: String,
// help_needed: String,
    constructor(data) {
        this.contact_name = data.name;
        this.contact_number = data.contact_number;
        this.patient_age = data.patient_age || null;
        this.patient_age = data.patient_age;
        this.location = data.location;
        this.oxygen_level = data.oxygen_level;
        this.hospital = data.hospital;
        this.help_needed = data.help_needed;
    }
}

const processSheetFromDB = async () => {
    const resp = await supabase.from("Demands").select("*").gt('id', '00fc53e5-225e-4ef4-ac85-d43cc21f937f');
    const data = resp['data'];
    new_data = data.map((item) => {
        return [item['id'], item['content'], item['name'], item['patient_age'], item['contact_number'], item['location'],
        item['oxygen_level'], item['source_id'], item['status'], item['source'], item['hospital'], item['datetime'], item['help_needed']]
    })
    console.log(new_data);
    sheets.updateSheet(sheets.jwt, new_data);
}

processSheetFromDB();


