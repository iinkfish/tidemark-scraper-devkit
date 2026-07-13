export const config = {
  name: "windy-wstation-innenstadt",
  schedule: "*/5 * * * *",
  pointSchema: "environmental-schema",
};

function kelvinToC(value){
   return value-273.15;
}

function msToKnots(value){
   return value*1.944;
}

function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

export async function run() {
  const url = "https://stations.windy.com/api/v2/opendata/station/f048433e/observation?key=90710d4e107a1a63460215ba6ecbb1c3d36039da6b4591578f674509347968d2";
 
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

const stationData = await response.json();
const fieldData = {temperature: kelvinToC(stationData.data.temp.at(-1)), dewpoint: kelvinToC(stationData.data.dew_point.at(-1)), rh: stationData.data.rh.at(-1), pressure: stationData.data.pressure.at(-1)/100, windspeed: msToKnots(stationData.data.wind.at(-1))}


 return {
    time: stationData.header.last_observation_time,
    medium: "air",
    location: "Augsburg, Innenstadt",
    measurement: "environmental",
    scrapedAt: new Date().toISOString(),
    fields: {
      temperature: {value: round(fieldData.temperature, 1), unit: "°C"},
      dewpoint: {value: round(fieldData.dewpoint, 1), unit: "°C"},
      rh: {value: round(fieldData.rh, 0), unit: "%"},
      pressure: {value: round(fieldData.pressure, 0), unit: "hPa"},
      windspeed: {value: round(fieldData.windspeed, 1), unit: "kt"},
    },
  };
}
