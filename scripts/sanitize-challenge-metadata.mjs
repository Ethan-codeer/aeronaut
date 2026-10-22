// Remove descriptive metadata from game JPEG copies without decoding/re-encoding
// pixels. Copyright attribution and source links are retained in the data model.
import { readdir, readFile, writeFile } from "node:fs/promises";
const directory = new URL("../public/images/challenges/", import.meta.url);
for (const name of await readdir(directory)) {
  if (!name.endsWith(".jpg")) continue;
  const file = new URL(name, directory),
    input = await readFile(file);
  if (input.readUInt16BE(0) !== 0xffd8) throw Error(`Invalid JPEG: ${name}`);
  const output = [input.subarray(0, 2)];
  let offset = 2;
  while (offset < input.length) {
    if (input[offset] !== 0xff) throw Error(`Invalid segment: ${name}`);
    const marker = input[offset + 1];
    if (marker === 0xda || marker === 0xd9) {
      output.push(input.subarray(offset));
      break;
    }
    const length = input.readUInt16BE(offset + 2);
    const end = offset + 2 + length;
    if (length < 2 || end > input.length)
      throw Error(`Invalid metadata: ${name}`);
    if (![0xe1, 0xed, 0xfe].includes(marker))
      output.push(input.subarray(offset, end));
    offset = end;
  }
  const cleaned = Buffer.concat(output);
  if (!input.equals(cleaned)) await writeFile(file, cleaned);
}
