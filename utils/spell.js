const axios = require("axios");

const validDetails = (data) => {
  // console.log(
  //   data.name.length === 1,
  //   data.contact_number.length === 1,
  //   data.location.length === 1
  // );

  return !(
    data.name.length === 1 &&
    data.contact_number.length === 1 &&
    data.location.length === 1
  );
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
