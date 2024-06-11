# DID Solution With IOTA

## Introduction

### Background

For example, the collaboration between BMW, Volkswagen, and Nissan in developing autonomous driving maps exemplifies the concept of "coopetition" — a blend of cooperation and competition. These automakers aim to accelerate technological development to enhance their competitive edge and raise industry entry barriers. To facilitate the sharing and development of new knowledge and technologies, they need to interlink their information systems to access shared resources.

### Issues

Traditionally, such interlinking relies on a new entity, perhaps a jointly established access control node by the three companies, which in turn determines the trust and security of the entire information system.

From a trust perspective, since these companies are competitors, any party manipulating this node—such as through authorization abuse or data interception — would collapse the trust chain. From a security standpoint, attacks on this node, whether by other competitors or malicious entities, such as denial-of-service attacks or hacking, would pose significant information security risks to all three companies.

### Solution

Therefore, a decentralized and trustworthy identity authentication framework is needed to address the issue of interlinking information systems. The IOTA Identity Framework offers a solution that combines these characteristics with low cost and high efficiency.

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
