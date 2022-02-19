# fodl-nft-lottery

Configure the variables described below

Run using `npm start`

## Environment variables

In .env file:

```
# Timestamp at which to take the snapshot
TIMESTAMP="Feb 19 2022 00:00:00 UTC"

# Ethereum websocket RPC provider for archival node (You can use alchemy to obtain one)
ETHEREUM_RPC_PROVIDER=

# Matic websocket RPC provider for archival node(You can use alchemy to obtain one)
MATIC_RPC_PROVIDER=

# Random lottery seed obtained from chainlink vrf (set to perform a lottery draw)
RANDOM_LOTTERY_SEED=
```
