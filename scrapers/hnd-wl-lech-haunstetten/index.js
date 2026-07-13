import { load } from "cheerio";

export const config = {
  name: "hnd-wl-lech-haunstetten",
  schedule: "*/15 * * * *",
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
  const url = "https://www.hnd.bayern.de/pegel/iller_lech/haunstetten-12003500";

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
  
  const firstRow = $(".tblsort tbody tr.row").first();
  const date = firstRow.find("td").eq(0).text().trim();
  const waterLevel = parseInt(firstRow.find("td").eq(1).text().trim(), 10);

  console.log(date);

  return {
    time: parseToISO(date),
    medium: "water",
    location: "Augsburg, Haunstetten",
    measurement: "environmental",
    scrapedAt: new Date().toISOString(),
    fields: {
      waterlevel: {value: waterLevel, unit: "cm"},
    },
  };
}
