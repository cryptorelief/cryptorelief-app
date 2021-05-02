require("dotenv").config();

const fs = require("fs-extra");

const { Parser } = require("json2csv");

const supabase = require("./db/init");

let data = [];

const processCSVFromDB = async (start) => {
  const { data: Demands, error } = await supabase
    .from("Demands")
    .select("*")
    .range(start, start + 999);

  data = data.concat(Demands);

  if (Demands.length >= 999) {
    processCSVFromDB(start + 999);
  } else {
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(data);

    fs.writeFileSync("data.csv", csv, "utf8");
  }
  //   const data = resp["data"];
  //   new_data = data.map((item) => {
  //     return [
  //       item["id"],
  //       item["content"],
  //       item["name"],
  //       item["patient_age"],
  //       item["contact_number"],
  //       item["location"],
  //       item["oxygen_level"],
  //       item["source_id"],
  //       item["status"],
  //       item["source"],
  //       item["hospital"],
  //       item["datetime"],
  //       item["help_needed"],
  //     ];
  //   });
  //   console.log(new_data);
  //   sheets.updateSheet(sheets.jwt, new_data);
};

processCSVFromDB(0);
