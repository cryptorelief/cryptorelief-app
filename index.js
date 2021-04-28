// Open a realtime stream of Tweets, filtered according to rules
// https://developer.twitter.com/en/docs/twitter-api/tweets/filtered-stream/quick-start
require("dotenv").config();
const axios = require("axios");
const { extractDetails } = require("./utils/spell");

// The code below sets the bearer token from your environment variables
// To set environment variables on macOS or Linux, run the export command below from the terminal:
// export BEARER_TOKEN='YOUR-TOKEN'
const token = process.env.BEARER_TOKEN;

const rulesURL = "https://api.twitter.com/2/tweets/search/stream/rules";
const streamURL = 'https://api.twitter.com/2/tweets/search/stream?user.fields=location&expansions=author_id,geo.place_id&tweet.fields=created_at,geo,lang&place.fields=country';

// this sets up two rules - the value is the search terms to match on, and the tag is an identifier that
// will be applied to the Tweets return to show which rule they matched
// with a standard project with Basic Access, you can add up to 25 concurrent rules to your stream, and
// each rule can be up to 512 characters long

// Edit rules as desired below
const rules = [
  {
    value: "(help OR need OR required OR available) (remdesivir OR tocilizumab) -is:retweet",
    tag: "injection",
  },
  {
    value: "(help OR need OR required OR available) oxygen -is:retweet",
    tag: "oxygen",
  },
  {
    value: "(help OR need OR required OR available OR donor) plasma -is:retweet",
    tag: "plasma",
  },
  {
    value: "(help OR need OR required OR available) bed -is:retweet",
    tag: "bed",
  },
  {
    value: "(help OR need OR required OR available) (ventilator OR icu OR ccu OR hdu) -is:retweet",
    tag: "icu/ventilator",
  },
  {
    value: "(test OR rtpcr OR antigen) -is:retweet",
    tag: "test",
  },
  // {
  //   value: "covid help -is:retweet",
  //   tag: "covid",
  // },
];

// {
//     value:
//       "-is:retweet has:geo (from:NWSNHC OR from:NHC_Atlantic OR from:NWSHouston OR from:NWSSanAntonio OR from:USGS_TexasRain OR from:USGS_TexasFlood OR from:JeffLindner1)",
//     tag: "theme:info has:geo original from weather agencies and gauges",
//   },

async function getAllRules() {
  const response = await axios.get(rulesURL, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

async function deleteAllRules(rules) {
  if (!Array.isArray(rules.data)) {
    return null;
  }

  const ids = rules.data.map((rule) => rule.id);

  const data = {
    delete: {
      ids: ids,
    },
  };

  const response = await axios.post(rulesURL, data, {
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

async function setRules() {
  const data = {
    add: rules,
  };

  const response = await axios.post(rulesURL, data, {
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

function streamConnect(retryAttempt) {
  const stream = axios
    .get(streamURL, {
      responseType: "stream",
      headers: {
        "User-Agent": "v2FilterStreamJS",
        Authorization: `Bearer ${token}`,
      },
      timeout: 20000,
    })
    .then((response) => {
      console.info(`streaming started...`);
      const stream = response.data;
      stream
        .on("data", async (data) => {
          try {
            const json = JSON.parse(data);
            const tweet = json.data.text;
            console.log("tweet", tweet);
            const userLocation = json.includes.users[0].location;
            const extractedData = await extractDetails(tweet);
            console.log(extractedData);

            // A successful connection resets retry count.
            retryAttempt = 0;
          } catch (e) {
            if (
              data.detail ===
              "This stream is currently at the maximum allowed connection limit."
            ) {
              console.log(data.detail);
              process.exit(1);
            } else {
              // Keep alive signal received. Do nothing.
            }
          }
        })
        .on("err", (error) => {
          if (error.code !== "ECONNRESET") {
            console.log(error.code);
            process.exit(1);
          } else {
            // This reconnection logic will attempt to reconnect when a disconnection is detected.
            // To avoid rate limits, this logic implements exponential backoff, so the wait time
            // will increase if the client cannot reconnect to the stream.
            setTimeout(() => {
              console.warn("A connection error occurred. Reconnecting...");
              streamConnect(++retryAttempt);
            }, 2 ** retryAttempt);
          }
        });
    })
    .catch(console.error);
}

(async () => {
  let currentRules;

  try {
    // Gets the complete list of rules currently applied to the stream
    currentRules = await getAllRules();

    // Delete all rules. Comment the line below if you want to keep your existing rules.
    await deleteAllRules(currentRules);

    // Add rules to the stream. Comment the line below if you don't want to add new rules.
    await setRules();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }

  // Listen to the stream.
  try {
    streamConnect(0);
  } catch (error) {
    console.error(error);
  }
})();
