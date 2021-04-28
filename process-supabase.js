require("dotenv").config();

const { extractDetails } = require("./utils/spell");

const supabase = require("./db/init");

const processSupabase = async () => {
  const { data } = await supabase
    .from("Demands")
    .select("*")
    .eq("status", "raw");

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const spellResponse = await extractDetails(row.content);

    if (spellResponse) {
      const { error } = await supabase
        .from("Demands")
        .update({
          status: "pending",
          name: spellResponse.name,
          contact_number: spellResponse.contact_number,
          patient_age:
            spellResponse.patient_age !== "–"
              ? spellResponse.patient_age
              : null,
          location:
            spellResponse.location !== "–"
              ? spellResponse.location
              : row.location,
          oxygen_level:
            spellResponse.oxygen_level !== "–"
              ? spellResponse.oxygen_level
              : null,
          help_needed: spellResponse.help_needed,
          hospital: spellResponse.hospital,
        })
        .eq("id", row.id);

      if (error) {
        console.log(error, row, spellResponse);
      } else {
        console.info(`Processed ${row.id}`);
      }
    } else {
      const { error } = await supabase
        .from("Demands")
        .update({
          status: "ai-filtered",
        })
        .eq("id", row.id);
    }
  }
};

processSupabase();
