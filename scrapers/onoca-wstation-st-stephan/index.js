import { load } from "cheerio";

export const config = {
  name: "onoca-wstation-st-stephan",
  schedule: "*/5 * * * *",
  pointSchema: "environmental-schema",
};

function kmhTokt(value){
        return value/1.852;
}

function parseDate(value){
        const parts = value.split(' ');

        const jsDate = new Date(`${parts[2]}T${parts[3]}`);

        return jsDate;
}

export async function run() {
const url = "http://w1.onoca.de/";

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const html = await response.text();
  const $ = load(html);

let fieldData = {};
const firstTable = $("table").first();

fieldData.temperature = parseFloat(firstTable.find("TR").first().find("TD").eq(2).text().trim());
fieldData.irradiance = parseFloat(firstTable.find("TR").eq(1).find("TD").eq(2).text().trim());
fieldData.pressure = parseFloat(firstTable.find("TR").eq(2).find("TD").eq(2).text().trim());
fieldData.rh = parseFloat(firstTable.find("TR").eq(3).find("TD").eq(2).text().trim());

const date = $("h2").first().text().trim();

fieldData.time = parseDate(date);

 return {
    time: fieldData.time,
    medium: "air",
    location: "Augsburg, St. Stephan",
    measurement: "environmental",
    scrapedAt: new Date().toISOString(),
    fields: {
      temperature: {value: fieldData.temperature, unit: "°C"},
      irradiance: {value: fieldData.irradiance, unit: "W/m²"},
      rh: {value: fieldData.rh, unit: "%"},
      pressure: {value: fieldData.pressure, unit: "hPa"},
    },
  };
}
