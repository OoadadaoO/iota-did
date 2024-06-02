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

  - `org/` - Web application for organization

  - `wallet/` - Web application for DID wallet

- `packages/` - Contains the packages that are sharedd by the applications

  - `iota/` - IOTA DID clients extended from [@iota/identity-wasm](https://github.com/iotaledger/identity.rs) with usefull functions

  - `lowdb/` - Custom [lowdb](https://github.com/typicode/lowdb) for local storage

- `examples/` - Examples that demonstrate the usage of the packages

## Get Started

### Prerequisites

- Node.js v20
- yarn 1.22

👉 [Installation Guide](https://adada1024.notion.site/NodeJs-f9a83de221e64e46ba930a62246f2256)

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

## Intergration

### [Firefly](https://github.com/iotaledger/firefly)

1. Create a new profile in Firefly.

2. Choose network > Custom network

3. Network > Custom

   Coin type > 4219 (for DID purpose)

   Node Address > https://api.testnet.iotaledger.net

4. Setup Profile > Restore > Use Stronghold backup

5. Import the stronghold file from `./wallet/<target_wallet>/wallet.stronghold`

6. Enter the password set in your .env file or script

7. Finish the other profile setup
