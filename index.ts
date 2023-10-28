import fs from 'fs';
import csvParser from 'csv-parser';

const results: Transaction[] = [];

// Get the first argument
const fileName = process.argv[2];

type Transaction = {
    'User Uuid': string;
    'Transaction Created At': string;
    'Transaction Id': string;
    Kind: string;
    Currency: string;
    'Fiat Display Currency': string;
    'Transaction Status Value': string;
    'Crypto Deposit From Address': string;
    'Crypto Withdrawal Address': string;
    'Onchain Transaction Id': string;
    'Measure Names': string;
    'Measure Values': string;
}

type GroupedTransaction = Transaction & {
    withdrawalFee: string,
    purchaseFee: string,
    fiatAmount: string,
    transactionAmount: string,
}

type Output = {
    Date: string;
    Type: 'buy' | 'sell' | 'trade' | 'payment' | 'gift' | 'donation' | 'fork' | 'airdrop' | 'mining' | 'payment' | 'reward' | 'rebate';
    'Received Currency': string;
    'Received Amount': string;
    'Received Net Worth'?: string;
    'Sent Currency': string;
    'Sent Amount': string;
    'Sent Net Worth'?: string;
    'Fee Currency': string;
    'Fee Amount': string;
    'Fee Net Worth'?: string;
}

async function read(): Promise<Transaction[]> {
    return new Promise((resolve, reject) => {
        fs.createReadStream(fileName)
        .pipe(csvParser())
        .on('data', (data: Transaction) => {
            results.push(data)
        })
        .on('end', () => {
            resolve(results);
        });
    })
}

function getGroupedTransactions(group: Transaction[]): GroupedTransaction {
    const first = group[0];
    const grouped: GroupedTransaction = {
        ...first,
        withdrawalFee: group[0]['Measure Values'],
        purchaseFee: group[1]['Measure Values'],
        fiatAmount: group[2]['Measure Values'],
        transactionAmount: group[3]['Measure Values'],
    }
    return grouped;
}

async function main() {
    const data = await read();
    // Group rows by 4s
    const groupedRows = data.reduce((acc, curr, index) => {
        const groupIndex = Math.floor(index / 4);
        if (!acc[groupIndex]) {
            acc[groupIndex] = [];
        }
        acc[groupIndex].push(curr);
        return acc;
    }, [] as Transaction[][])

    // Map each group to a row
    const output: Output[] = [];
    let i = -1;
    while (i < groupedRows.length - 1) {
        i++;
        const group = groupedRows[i];
        const first = group[0];
        const grouped = getGroupedTransactions(group);
        const { Kind, Currency, "Fiat Display Currency": Fiat, withdrawalFee, purchaseFee, fiatAmount: fiatStr, transactionAmount: transactionStr} = grouped;
        const fiatAmount = Math.abs(parseFloat(fiatStr)).toString();
        const transactionAmount = Math.abs(parseFloat(transactionStr)).toString();
        let type;
        let ReceivedCurrency = '';
        let ReceivedAmount = '';
        let SentCurrency = '';
        let SentAmount = '';
        if ((Kind === 'viban_purchase' && Currency !== Fiat) || Kind === 'crypto_purchase') {
            type = 'buy';
            ReceivedCurrency = Currency;
            ReceivedAmount = transactionAmount;
            SentCurrency = Fiat;
            SentAmount = fiatAmount;
        }
        if (Kind === "crypto_viban_exchange" && Currency !== Fiat) {
            type = 'sell';
            ReceivedCurrency = Fiat;
            ReceivedAmount = fiatAmount;
            SentCurrency = Currency;
            SentAmount = transactionAmount;
        }
        if (Kind === "supercharger_reward_to_app_credited" || Kind == "rewards_platform_deposit_credited" || Kind === "referral_gift") {
            type = 'reward';
            ReceivedCurrency = Currency;
            ReceivedAmount = transactionAmount;
        }
        // Exchange types
        if (Kind === "crypto_exchange") {
            // Grab next row
            const next = groupedRows[++i];
            const nextGrouped = getGroupedTransactions(next);
            type = 'trade';
            ReceivedCurrency = Currency;
            ReceivedAmount = transactionAmount;
            SentCurrency = nextGrouped.Currency;
            SentAmount = Math.abs(parseFloat(nextGrouped.transactionAmount)).toString();
        }
        if (type) {
            // Parse a date that is in the format DD/MM/YYYY HH:MM:SS to a date object
            const date = first['Transaction Created At'];
            const [day, month, year] = date.split(' ')[0].split('/');
            const [hour, minute, second] = date.split(' ')[1].split(':');
            const usDate = `${month}/${day}/${year} ${hour}:${minute}:${second || '00'}`;
            output.push({
                Date: usDate,
                Type: type,
                "Received Amount": ReceivedAmount,
                "Received Currency": ReceivedCurrency,
                "Sent Amount": SentAmount,
                "Sent Currency": SentCurrency,
                "Fee Amount": '0',
                "Fee Currency": Fiat,
            });
        }
    }

    // Write results to file
    const outputFileName = 'output.csv';
    const header = Object.fromEntries(Array.from(Object.entries(output[0])).map(([key]) => [key, key]));
    const outputCsv = [header, ...output].map((row) => {
        return Object.values(row).join(',');
    }).join('\n');
    fs.writeFileSync(outputFileName, outputCsv);
}
main()
