import { GroupedTransaction, OutputType, GroupedOutput } from "./types";
import { format } from "date-fns";

export function formatCryptoCom(groupedRows: GroupedTransaction[]) {
	const output: GroupedOutput[] = [];
	let i = -1;
	while (i < groupedRows.length - 1) {
		i++;
		const grouped = groupedRows[i];
		const {
			Kind,
			Currency,
			"Fiat Display Currency": Fiat,
			withdrawalFee,
			purchaseFee,
			fiatAmount: fiatStr,
			transactionAmount: transactionStr,
		} = grouped;
		const fiatAmount = Math.abs(parseFloat(fiatStr)).toString();
		const transactionAmount = Math.abs(parseFloat(transactionStr)).toString();
		let type: OutputType | undefined = undefined;
		let ReceivedCurrency = "";
		let ReceivedAmount = "";
		let SentCurrency = "";
		let SentAmount = "";
		if (
			(Kind === "viban_purchase" && Currency !== Fiat) ||
			Kind === "crypto_purchase"
		) {
			type = "buy";
			ReceivedCurrency = Currency;
			ReceivedAmount = transactionAmount;
			SentCurrency = Fiat;
			SentAmount = fiatAmount;
		}
		if (Kind === "crypto_viban_exchange" && Currency !== Fiat) {
			type = "sell";
			ReceivedCurrency = Fiat;
			ReceivedAmount = fiatAmount;
			SentCurrency = Currency;
			SentAmount = transactionAmount;
		}
		if (
			Kind === "supercharger_reward_to_app_credited" ||
			Kind == "rewards_platform_deposit_credited" ||
			Kind === "referral_gift"
		) {
			type = "reward";
			ReceivedCurrency = Currency;
			ReceivedAmount = transactionAmount;
		}
		// Exchange types
		if (Kind === "crypto_exchange") {
			// Grab next row
			const next = groupedRows[++i];
			type = "trade";
			ReceivedCurrency = Currency;
			ReceivedAmount = transactionAmount;
			SentCurrency = next.Currency;
			SentAmount = Math.abs(parseFloat(next.transactionAmount)).toString();
		}
		if (type) {
			const usDate = format(grouped.date, "MM/dd/yyyy HH:mm:ss");
			output.push({
				group: grouped,
				formatted: {
					Date: usDate,
					Type: type,
					"Received Amount": ReceivedAmount,
					"Received Currency": ReceivedCurrency,
					"Sent Amount": SentAmount,
					"Sent Currency": SentCurrency,
					"Fee Amount": "0",
					"Fee Currency": Fiat,
				},
			});
		}
	}
	return output;
}

export const cryptoColumns = [
	"Date",
	"Type",
	"Received Currency",
	"Received Amount",
	"Received Net Worth",
	"Sent Currency",
	"Sent Amount",
	"Sent Net Worth",
	"Fee Currency",
	"Fee Amount",
	"Fee Net Worth",
];
