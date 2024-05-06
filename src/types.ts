export type Transaction = {
	"User Uuid": string;
	"Transaction Created At": string;
	"Transaction Id": string;
	Kind: string;
	Currency: string;
	"Fiat Display Currency": string;
	"Transaction Status Value": string;
	"Crypto Deposit From Address": string;
	"Crypto Withdrawal Address": string;
	"Onchain Transaction Id": string;
	"Measure Names": string;
	"Measure Values": string;
};
export type GroupedTransaction = Transaction & {
	date: Date;
	withdrawalFee: string;
	purchaseFee: string;
	fiatAmount: string;
	transactionAmount: string;
};

export type OutputType =
	| "buy"
	| "sell"
	| "trade"
	| "payment"
	| "gift"
	| "donation"
	| "fork"
	| "airdrop"
	| "mining"
	| "reward"
	| "rebate";

export type CryptoComOutput = {
	Date: string;
	Type: OutputType;
	"Received Currency": string;
	"Received Amount": string;
	"Received Net Worth"?: string;
	"Sent Currency": string;
	"Sent Amount": string;
	"Sent Net Worth"?: string;
	"Fee Currency": string;
	"Fee Amount": string;
	"Fee Net Worth"?: string;
};

export type GroupedOutput = {
	group: GroupedTransaction;
	formatted: CryptoComOutput;
};
