# DID Solution With IOTA

## Introduction

### Background

Centralized identities face security issues due to single points of failure, making them vulnerable to data breaches and identity theft. Trust is also problematic as users must rely on central authorities to manage and verify their identities. Decentralized Identifiers (DIDs) and Self-Sovereign Identity (SSI) address these issues by enabling individuals to control their own identities, reducing reliance on central authorities, and enhancing security through distributed ledger technologies.

Decentralized Identifiers (DIDs) and Self-Sovereign Identity (SSI) have become global trends, with initiatives like the EU's eIDAS2.0 and Taiwan's forthcoming digital identity wallet. Beyond issuing citizen identities, governments are encouraging enterprises to join as identity issuers and integrate with the government wallet, aiming to provide citizens with safer and more convenient digital identity use cases.

### Issues

In today's development landscape, both governments and enterprises have a strong demand for implementing decentralized identity issuance and verification. However, many enterprises may delay or reject development due to technical inadequacies or the high research costs associated with this cutting-edge technologies. Additionally, enterprise management department requires a user-friendly UI to efficiently manage DID documents responsible for identity issuance.

### Solution

Therefore, we provide a reference implementation for deploying decentralized identity, alongside a user-friendly DID management wallet. This solution is based on the IOTA Tangle, which is a distributed ledger technology that is feeless, scalable, and secure. Our solution includes a DID wallet and an organization management system, which can be easily integrated into existing systems. Unlike common digital identity wallets that only have functions of create DID, store VCs and present VPs, our DID wallet allows users to manage their DIDs, which is essential for enterprise management departments.

## Folder Structure

- `apps/` - Contains the applications and examples

  - `org/` - Web application by [Next.js](https://github.com/vercel/next.js) for organization

  - `org-server/` - Server by [Express](https://github.com/expressjs/express) for IOTA operations of organization

  - `wallet/` - Web application by [Next.js](https://github.com/vercel/next.js) for DID wallet

  - `wallet-server/` - Server by [Express](https://github.com/expressjs/express) for IOTA operations of DID wallet

- `packages/` - Contains the packages that are sharedd by the applications

  - `iota/` - IOTA DID clients with usefull functions extended from [@iota/identity-wasm](https://github.com/iotaledger/identity.rs) and [@iota/sdk | @iota/sdk-wasm](https://github.com/iotaledger/iota-sdk)

  - `lowdb/` - Custom [lowdb](https://github.com/typicode/lowdb) with optional encryption as local database

- `examples/` - Examples that demonstrate the usage of the packages

- `db/` - Default directory for the local databases

- `wallet/` - Default directory for the IOTA wallets and key storages

## Getting Started

> All the command below should be executed in the root of this repo.

### Prerequisites

- Node.js v20
- Yarn v1.22

> If you have not installed Node.js and Yarn or have any problem with versioning, you can install them by following this [Guide to Installation](https://adada1024.notion.site/NodeJs-f9a83de221e64e46ba930a62246f2256).

### Clone the repository

```bash
git clone https://github.com/OoadadaoO/iota-did-public.git
cd iota-did-public/

# pull the latest changes
git pull
```

### Installation

```bash
yarn install --frozen-lockfile
```

### Run Example

Build the example and its dependencies

```bash
yarn examples build
```

Run the example in [`./examples`](./examples/package.json)

- Create/Edit **DID doument**, wallet and key storage placed in [`./wallet/test`](./wallet/test/)

  ```bash
  yarn examples test:did
  ```

- Create/Validate/Revoke **Verifiable Credential** and **Verifiable Presentation**, wallet and key storage placed in [`./wallet/issuer`](./wallet/issuer/) and [`./wallet/holder`](./wallet/holder/)

  ```bash
  yarn examples test:vc_vp
  ```

### Run Wallet Web Application

Setup the environment variables,

```bash
cp apps/wallet-server/.env.example apps/wallet-server/.env
cp apps/wallet/.env.example apps/wallet/.env.local
```

Edit the environment variables following the explanation below,

```ini
# apps/wallet-server/.env

PORT=8081    # express listening port
DB_PASSWORD= # password for local database, optional
IOTA_FAUCET_ENDPOINT=https://faucet.testnet.iotaledger.net/api/enqueue
IOTA_API_ENDPOINT=https://api.testnet.iotaledger.net


# apps/wallet/.env.local

PASSWORD_SECRET=    # secret for stronghold password encryption ($ openssl rand -base64 32)
PASSWORD_EXPIRES=1h # stronghold password expires, supports  s, m, h, d, w.
IOTA_EXPRESS_URL=http://localhost:8081     # express listening url, same as PORT in wallet-server
NEXT_PUBLIC_BASE_URL=http://localhost:8080 # base url for the web application
```

Build and run the server,

```bash
yarn wallet-server build && yarn wallet-server start
```

**Keep the server running** and open a new terminal, build and run the application,

```bash
yarn wallet build && yarn wallet start -p 8080  # the flag -p should be the same as NEXT_PUBLIC_BASE_URL in .env.local
```

Open the browser and go to `http://localhost:8080`. If you run on a remote server, use ssh port forwarding to access the web application.

### Run Org Web Application

Setup the environment variables,

```bash
cp apps/org-server/.env.example apps/org-server/.env
cp apps/org/.env.example apps/org/.env.local
```

Edit the environment variables following the explanation below,

```ini
# apps/org-server/.env

PORT=8001          # express listening port
NAME=NMLAB          # wallet's name (you've set it in our Wallet app)
WALLET_PASSWORD=   # wallet's stronghold password (you've set it in our Wallet app)
IOTA_API_ENDPOINT=https://api.testnet.iotaledger.net


# apps/org/.env.local

AUTH_SALT_ROUNDS=10    # salt rounds for password hashing
AUTH_SECRET=           # secret for jwt encryption ($ openssl rand -base64 32)
AUTH_EXPIRES=1d        # jwt expires, supports  s, m, h, d, w.
DB_PASSWORD=           # password for local database, optional
VC_REVALIDATE_TIME=30d # revalidate time for partner user's verifiable credentials
IOTA_EXPRESS_URL=http://localhost:8001     # express listening url, same as PORT in org-server
NEXT_PUBLIC_NAME=NMLAB                      # organization name displayed in the web application
NEXT_PUBLIC_BASE_URL=http://localhost:8000 # base url for the web application
```

Build and run the server,

```bash
yarn org-server build && yarn org-server start
```

**Keep the server running** and open a new terminal, build and run the application,

```bash
yarn org build && yarn org start -p 8000    # the flag -p should be the same as NEXT_PUBLIC_BASE_URL in .env.local
```

Open the browser and go to `http://localhost:8000`. If you run on a remote server, use ssh port forwarding to access the web application.

## Intergration

### [Firefly](https://github.com/iotaledger/firefly)

1. Create a new profile in Firefly.

2. Choose network > Custom network

3. _Network_ > Custom

   _Coin type_ > 4219 (for DID purpose)

   _Node Address_ > https://api.testnet.iotaledger.net

4. Setup Profile > Restore > Use Stronghold backup

5. Import the stronghold file from `./wallet/<target_wallet>/wallet.stronghold`

6. Enter the password set in your .env file or script

7. Finish the other profile setup
