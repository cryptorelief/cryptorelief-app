const axios = require("axios");

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
          tweet_content: content.replace(/\n/g, " "),
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SPELL_KEY}`,
        },
      }
    );

    console.log(response);

    if (response.data.variations.length) {
      if (validDetails(response.data.variations[0])) {
        return response.data.variations[0];
      }
    }
  } catch (error) {
    console.error(error.response);
  }
};

module.exports = {
  extractDetails,
};
