require("dotenv").config();

const { extractDetails } = require("./utils/spell");

const supabase = require("./db/init");

const processSupabase = async () => {
  const { data, error } = await supabase
    .from("Demands")
    .select("*")
    .eq("status", "raw");

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    console.log(`processing ${row.id}`);
    console.log(await extractDetails(row.content));
  }
};

processSupabase();
