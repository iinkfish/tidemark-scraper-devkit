import { load } from "cheerio";

export const config = {
  name: "lfu-pmNOX-karl",
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
   const urlno2 = "https://www.lfu.bayern.de/luft/immissionsmessungen/messwerte/stationen/detail/1401/172";
   const urlpm10 = "https://www.lfu.bayern.de/luft/immissionsmessungen/messwerte/stationen/detail/1401/132/";

	async function parsePage(fetchURL){
	  const result = {};
	  const response = await fetch(fetchURL, {
	    headers: {
	      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
	    },
	  });

	  if (!response.ok) {
	    throw new Error(`HTTP error! Status: ${response.status}`);
	  }

	   const html = await response.text(); 
	   const $ = load(html);

	   const hourlyTable = $("table.autorow2").eq(-1);

	   const firstDataRow = hourlyTable.find("tr").has("td").first();

	   result.date = firstDataRow.find("td").eq(0).text().trim();
	   const value = firstDataRow.find("td").eq(1).text().trim();
	   let parsed = parseInt(value);
           
       result.value = Number.isNaN(parsed) ? -999 : parsed;
	return result;
	}
   const pm10 = await parsePage(urlpm10);
   const no2 = await parsePage(urlno2);

  return {
    time: parseToISO(pm10.date),
    medium: "air",
    location: "Augsburg, Karlstraße",
    measurement: "environmental",
    scrapedAt: new Date().toISOString(),
    fields: {
      pm10: {value: pm10.value, unit: "µg/m³"},
      no2: {value: no2.value, unit: "µg/m³"},
    },
  };
}
