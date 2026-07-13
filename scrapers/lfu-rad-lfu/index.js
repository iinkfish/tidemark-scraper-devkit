import { load } from "cheerio";

export const config = {
  name: "lfu-rad-lfu",
  schedule: "1 * * * *",
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
  
  const url = "https://www.lfu.bayern.de/strahlung/ifr/stationen/detail/708/200";
 
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

  // 1. Target the radiation measurement table
  const targetTable = $(".cnt_mw_table");

  // 2. Grab the first row that explicitly contains data cells
  const firstDataRow = targetTable.find("tr").has("td").first();

  // 3. Extract the date text
  const date = firstDataRow.find("td").eq(0).text().trim();

  // 4. Navigate into the nested <span> to get the clean measurement value
  const valueRaw = firstDataRow.find("td.values span").text().trim();
  const valueClean = parseFloat(valueRaw.replace(",", "."));

  return {
    time: parseToISO(date),
    medium: "radiation",
    location: "Augsburg, LfU",
    measurement: "environmental",
    scrapedAt: new Date().toISOString(),
    fields: {
      rad: {value: valueClean, unit: "µSv/h"},
    },
  };
}
