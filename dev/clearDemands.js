require("dotenv").config();

const supabase = require("../db/init");

supabase.from("Demands").delete().then(console.log);
