import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";

export function read<T>(filename: string): T[] {
	const data = fs.readFileSync(filename, "utf-8");
	return parse(data, {
		columns: true,
		skip_empty_lines: true,
	}) as T[];
}

export function write(filename: string, output: Record<string, string>[]) {
	// Write results to file
	const outputFileName = path.resolve(
		__dirname,
		"../output",
		`${new Date().toISOString().replaceAll(":", "-")}-${filename}.csv`,
	);
	const outputCsv = stringify(output, { header: true });
	fs.writeFileSync(outputFileName, outputCsv);
}
