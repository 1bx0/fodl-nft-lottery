# fodl-nft-lottery

Configure the variables described below

Run using `npm start`

## Environment variables

In .env file:

```
# Block at which we take the snapshot on ethereum
ETHEREUM_SNAPSHOT_BLOCK=14202100

# Ethereum websocket RPC provider for archival node (You can use alchemy to obtain one)
ETHEREUM_RPC_PROVIDER=

# Block at which we take the snapshot on matic
MATIC_SNAPSHOT_BLOCK=24917978

# Matic websocket RPC provider for archival node(You can use alchemy to obtain one)
MATIC_RPC_PROVIDER=

# URL for boatlifters allocation
BOATLIFTERS_SNAPSHOT_URL="https://arweave.net/D2UygFB2vGmtEAUUHyD7Ttdw0N-fTSkyVYQwaBtMhPU"

# Random lottery seed obtained from chainlink vrf (only set this if performing a lottery draw)
RANDOM_LOTTERY_SEED=
```
