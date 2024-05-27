# DID Solution With IOTA

## Introduction

### Folder Structure

- `apps/` - Contains the applications and examples

  - `examples/` - Examples that demonstrate the usage of the packages

- `packages/` - Contains the packages that are sharedd by the applications

  - `iota/` - IOTA DID client with usefull functions

  - `lowdb/` - Custom [lowdb](https://github.com/typicode/lowdb) implementation for key storage

## Get Started

### Prerequisites

- Node.js v20
- yarn 1.22

### Installation

```bash
yarn install --frozen-lockfile
```

### Run Example

Build the example and its dependencies

```bash
yarn examples build
```

Run the example `apps/examples`

- Create/Edit **DID doument**, key info stored in `apps/examples/db/test.json`

  ```bash
  yarn examples test:did
  ```

- Create/Validate/Revoke **Verifiable Credential** and **Verifiable Presentation** , key info stored in `apps/examples/db/issuer.json` and `apps/examples/db/holder.json`

  ```bash
  yarn examples test:vc_vp
  ```
