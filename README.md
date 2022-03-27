# fodl-nft-lottery

Configure the variables described below. To run the snapshot at a certain timestamp you must run all the lotteries before it.

Run using `npm run docker`

## Environment variables

In .env file:

```
# Ethereum websocket RPC provider for archival node (You can use alchemy to obtain one)
ETHEREUM_RPC_PROVIDER=

# Polygon websocket RPC provider for archival node(You can use alchemy to obtain one)
MATIC_RPC_PROVIDER=

# Bnb websocket RPC provider for archival node(You can use a publicly available one)
BNB_RPC_PROVIDER=

# Timestamp at which to take the snapshot (optional)
TIMESTAMP="02 14 2022 00:00:00 UTC"
```
