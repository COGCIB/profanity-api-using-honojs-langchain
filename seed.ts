import fs from "fs";
import { promises } from "dns";
import csv from "csv-parser";
import { parse } from "path";

import { Index } from "@upstash/vector";

const index = new Index({
  url: "https://intimate-hedgehog-92813-eu1-vector.upstash.io",
  token:
    "ABsFMGludGltYXRlLWhlZGdlaG9nLTkyODEzLWV1MWFkbWluTVdVME5XUm1ZekF0WWpNM05DMDBaVEprTFdJMFpEWXRNelpqWmpkak5tVXlPVGd5",
});

interface Row {
  text: string;
}

async function parseCSV(filePath: string): Promise<Row[]> {
  return new Promise((resolve, reject) => {
    const rows: Row[] = [];
    fs.createReadStream(filePath)
      .pipe(csv({ separator: "," }))
      .on("data", (row) => {
        rows.push(row);
      })
      .on("error", (err) => {
        reject(err);
      })
      .on("end", () => {
        resolve(rows);
      });
  });
}
const STEP = 40;
const seed = async () => {
  const data = await parseCSV("training_dataset.csv");
  for (let i = 0; i < data.length; i += STEP) {
    const chunk = data.slice(i, STEP + i);
    const formatted = chunk.map((el, index) => {
      return { data: el.text, id: i + index, metadata: { text: el.text } };
    });

    await index.upsert(formatted);
  }
};

seed();
