# Crypto.com Tax Importer

This Node.js program will convert your export files from Crypto.com into formats that can be imported into various online crypto tax platforms.

The two output's currently supported are:
* [Crypto.com tax](https://tax.crypto.com/)
* [Koinly](https://koinly.io/)

## Disclaimer

I am not a tax professional. This program is provided as-is and I make no guarantees about its accuracy. Please ensure the outputs are correct before importing them into your tax platform.

## Usage
Download your CSV export from Crypto.com

You will want to use the file called `App Transactions.csv` as the input file.

```shell
npm start "path/to/App Transactions.csv"
```

The results will be placed in the `output` directory.
