# automation-bots

## required environment variables

### If running locally

Acessible to .npmrc:
NPM_TOKEN

In .env file:

JSON_RPC_PROVIDER
PRIVATE_KEY
WALLET_MIN_ETH

DISCORD_TOKEN
BOT_CHANNEL_ID
FATAL_CHANNEL_ID

(optional - default to deployed addresses)
USDC_STAKING_ADDRESS
ETH_STAKING_ADDRESS
LP_STAKING_AUTOMATION_ADDRESS
FODL_TOKEN_ADDRESS
TREASURY_ADDRESS

### If building docker image:

When building:
use --build-arg NPM_TOKEN=your_token_value

When running:

JSON_RPC_PROVIDER
PRIVATE_KEY
WALLET_MIN_ETH

DISCORD_TOKEN
BOT_CHANNEL_ID
FATAL_CHANNEL_ID

(optional - default to deployed addresses)
USDC_STAKING_ADDRESS
ETH_STAKING_ADDRESS
LP_STAKING_AUTOMATION_ADDRESS
FODL_TOKEN_ADDRESS
TREASURY_ADDRESS
