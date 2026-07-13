export const config = {
  name: "noaa-EDMA",
  schedule: "*/20 * * * *",
  pointSchema: "environmental-schema",
};

export async function run() {
  const url = "https://aviationweather.gov/api/data/metar?ids=EDMA&format=json";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const data = await response.json();
  // console.log(data);

  return {
    time: data[0].reportTime,
    medium: "air",
    location: "Augsburg, Flughafen EDMA",
    measurement: "environmental",
    scrapedAt: new Date().toISOString(),
    fields: {
      temperature: {value: parseInt(data[0].temp), unit: "°C"},
      dewpoint: {value: parseInt(data[0].dewp), unit: "°C"},
      winddir: {value: parseInt(data[0].wdir), unit: "°"},
      windspeed: {value: parseInt(data[0].wspd), unit: "kts"},
    },
  };
}
