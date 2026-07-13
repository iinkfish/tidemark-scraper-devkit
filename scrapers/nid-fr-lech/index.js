import { load } from "cheerio";

export const config = {
  name: "nid-fr-lech",
  schedule: "0 1 * * *",
  pointSchema: "environmental-schema",
};

function parseToISO(dateStr) {
  const cleanStr = dateStr.replace(/uhr/i, '').replace(/,/g, '').trim();
  
  const [datePart, timePart] = cleanStr.split(/\s+/);
  const [day, month, year] = datePart.split('.');
  
  const pad = (num) => String(num).padStart(2, '0');
  
  let hours = '00';
  let minutes = '00';
  
  if (timePart) {
    const [h, m] = timePart.split(':');
    hours = pad(h);
    minutes = pad(m);
  }
  
  const isoFormattedString = `${year}-${pad(month)}-${pad(day)}T${hours}:${minutes}:00+02:00`;
  
  return new Date(isoFormattedString).toISOString();
}

export async function run() {
  const url = "https://www.nid.bayern.de/abfluss/donau_bis_kelheim/augsburg-u-d-wertachmuendung-12006000";

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

  const firstRow = $(".tblsort tbody tr.row0").first();
  const date = firstRow.find("td").eq(0).text().trim();
  const flowrateRaw = firstRow.find("td").eq(1).text().trim();
  const flowrateNum = parseFloat(flowrateRaw.replace(",", "."));

  return {
    time: parseToISO(date),
    medium: "water",
    location: "Augsburg, Wertachmuendung",
    measurement: "environmental",
    scrapedAt: new Date().toISOString(),
    fields: {
      flowrate: {value: flowrateNum, unit: "m³/s"},
    },
  };
}
