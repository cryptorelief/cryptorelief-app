const axios = require("axios");

axios.defaults.headers.common[
  "Authorization"
] = `Bearer ${process.env.SPELL_KEY}`;

const validDetails = (data) => {
  return !(((data.name === data.contact_number) === data.location) === "–");
};

const extractDetails = async (content) => {
  try {
    const response = await axios.post(
      "https://api.spell.tools/v1/generate-content",
      {
        template: "covid_tweet_parse",
        variations: 1,
        input: {
          tweet_content: content,
        },
      }
    );

    if (response.data.variations.length) {
      if (validDetails(response.data.variations[0])) {
        return response.data.variations[0];
      }
    }
  } catch (error) {
    console.error(error.response.data);
  }
};

module.exports = {
  extractDetails,
};
