import { CryptoComOutput, GroupedOutput, GroupedTransaction } from "./types";
import { format } from "date-fns";

type KoinlyUniversal = Pick<
	CryptoComOutput,
	| "Date"
	| "Sent Amount"
	| "Sent Currency"
	| "Received Amount"
	| "Received Currency"
	| "Fee Amount"
	| "Fee Currency"
> & {
	Label: IncomingTag | OutgoingTag | "";
	"Net Worth Amount": "";
	"Net Worth Currency": "";
	Description: "";
	TxHash: "";
};

export const koinlyUniversalColumns = [
	"Date",
	"Sent Amount",
	"Sent Currency",
	"Received Amount",
	"Received Currency",
	"Fee Amount",
	"Fee Currency",
	"Net Worth Amount",
	"Net Worth Currency",
	"Label",
	"Description",
	"TxHash",
];

/**
 * Format using the universal Koinly format
 * @see https://support.koinly.io/hc/en-us/articles/9914912005916-How-to-create-a-custom-CSV-file-with-your-data
 * @see https://docs.google.com/spreadsheets/d/1dESkilY70aLlo18P3wqXR_PX1svNyAbkYiAk2tBPJng/edit#gid=0
 */
export function formatKoinlyUniversal(
	groups: GroupedOutput[],
): KoinlyUniversal[] {
	return groups.map(({ group, formatted }) => {
		return {
			Date: formatDate(group.date),
			"Sent Amount": formatted["Sent Amount"],
			"Sent Currency": formatted["Sent Currency"],
			"Received Amount": formatted["Received Amount"],
			"Received Currency": formatted["Received Currency"],
			"Fee Amount": formatted["Fee Amount"],
			"Fee Currency": formatted["Fee Currency"],
			"Net Worth Amount": "",
			"Net Worth Currency": "",
			Label: formatted.Type === "reward" ? "reward" : "",
			Description: "",
			TxHash: "",
		};
	});
}

type KoinlyTrade = {
	"Koinly Date": string;
	Pair: string;
	Side: "Buy" | "Sell";
	Amount: string;
	Total: string;
	"Fee Amount": string;
	"Fee Currency": string;
	"Order ID": "";
	"Trade ID": "";
};
export function formatKoinlyTrades(groups: GroupedOutput[]): KoinlyTrade[] {
	return groups
		.filter(({ formatted: { Type } }) => Type === "buy" || Type === "sell")
		.map(({ group, formatted }) => {
			return {
				"Koinly Date": formatDate(group.date),
				Pair: `${formatted["Sent Currency"]}-${formatted["Received Currency"]}`,
				Side: formatted.Type === "buy" ? "Buy" : "Sell",
				Amount: formatted["Received Amount"],
				Total: formatted["Sent Amount"],
				"Fee Amount": formatted["Fee Amount"],
				"Fee Currency": formatted["Fee Currency"],
				"Order ID": "",
				"Trade ID": "",
			};
		});
}

function formatDate(date: Date) {
	// Format should match 2018-01-01 14:25 UTC
	return format(date, "yyyy-MM-dd HH:mm 'UTC'");
}

export type IncomingTag =
	| "gift"
	| "lost"
	| "donation"
	| "cost"
	| "loan fee"
	| "margin fee"
	| "loan repayment"
	| "margin repayment"
	| "stake"
	| "realized gain";
export type OutgoingTag =
	| "airdrop"
	| "fork"
	| "mining"
	| "reward"
	| "income"
	| "lending interest"
	| "cashback"
	| "salary"
	| "fee refund"
	| "loan"
	| "margin loan"
	| "stake"
	| "realized gain";
