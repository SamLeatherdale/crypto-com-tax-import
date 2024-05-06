import { GroupedTransaction, Transaction } from "./types";
import { read, write } from "./csv";
import { formatCryptoCom } from "./crypto";
import { formatKoinlyUniversal } from "./koinly";
import { isValid, parse } from "date-fns";

function groupTransactions(data: Transaction[]) {
	// Group rows by 4s
	const groupedRows = data.reduce((acc, curr, index) => {
		const groupIndex = Math.floor(index / 4);
		if (!acc[groupIndex]) {
			acc[groupIndex] = [];
		}
		acc[groupIndex].push(curr);
		return acc;
	}, [] as Transaction[][]);
	return groupedRows.map(aggregateTransactions);
}

function aggregateTransactions(group: Transaction[]): GroupedTransaction {
	const first = group[0];
	return {
		...first,
		date: parseDate(first["Transaction Created At"]),
		withdrawalFee: group[0]["Measure Values"],
		purchaseFee: group[1]["Measure Values"],
		fiatAmount: group[2]["Measure Values"],
		transactionAmount: group[3]["Measure Values"],
	};
}

function parseDate(date: string) {
	// Multiple date formats used
	const formats = ["dd/MM/yyyy HH:mm:ss", "dd/MM/yyyy HH:mm"];
	for (const format of formats) {
		const parsed = parse(date, format, new Date());
		if (isValid(parsed)) {
			return parsed;
		}
	}
	throw new Error(`Invalid date format: ${date}`);
}

function main() {
	// Get the first argument
	const fileName = process.argv[2];

	const data = read<Transaction>(fileName);
	const groupedRows = groupTransactions(data);

	// Map each group to a row
	const output = formatCryptoCom(groupedRows);
	const koinly = formatKoinlyUniversal(output);

	write(
		"crypto-com",
		output.map(({ formatted }) => formatted),
	);
	write("koinly", koinly);
}
main();
