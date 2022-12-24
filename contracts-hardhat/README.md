# Event Trader smart contracts

BSC Testnet addresses:

- Event Trader: [0xb1b7e1aE6Fa65eBfd373f8305C0F4132e6cE252c](https://testnet.bscscan.com/address/0xb1b7e1aE6Fa65eBfd373f8305C0F4132e6cE252c)
- Ticket Token Collection: [0x4aEd32F4da1ee71387a7E0F771689C30716827b2](https://testnet.bscscan.com/address/0x4aEd32F4da1ee71387a7E0F771689C30716827b2)
- Goods Token Collection: [0x6b2Efa03ED42E768C617bE9539027f765C3816F8](https://testnet.bscscan.com/address/0x6b2Efa03ED42E768C617bE9539027f765C3816F8)

## Tools

- [Hardhat](https://github.com/nomiclabs/hardhat): compile and run the smart contracts on a local development network
- [TypeChain](https://github.com/ethereum-ts/TypeChain): generate TypeScript types for smart contracts
- [Ethers](https://github.com/ethers-io/ethers.js/): renowned Ethereum library and wallet implementation
- [Waffle](https://github.com/EthWorks/Waffle): tooling for writing comprehensive smart contract tests
- [Solhint](https://github.com/protofire/solhint): linter
- [Solcover](https://github.com/sc-forks/solidity-coverage) code coverage
- [Prettier Plugin Solidity](https://github.com/prettier-solidity/prettier-plugin-solidity): code formatter

## Usage

### Pre Requisites

Before running any command, make sure to install dependencies:

```sh
$ yarn install
```

### Environment variables

Environment file `.env-example` should be properly filled and renamed to `.env`.

- **INFURA_API_KEY** can be found on [infura.io](https://infura.io/) in project settings by copying `API KEY`.
- **MNEMONIC** can be found in the MetaMask `Settings > Security & Privacy > Secret Recovery Phrase`.

Every block explorer built by Etherscan ( eg. BscScan, PolygonScan, HecoInfo ) requires a different account to be created and hence a different set of API keys. API Keys can be found/added on the [etherscan.io](https://etherscan.io/myaccount) in the API Keys section.

- **ETHERSCAN_API_KEY**
- **BSC_ETHERSCAN_API_KEY**
- **POLYGON_ETHERSCAN_API_KEY**
- **ALCHEMY_URL**

### Networks

The list of networks can be found in `root` folder `hardhat.network.ts` file.

### Deploy

Deploy all the smart contracts to specific network:

```sh
$ yarn deploy <NETWORK>
```

or deploy just one smart contract to specific network

```sh
$ yarn deploy <NETWORK> --tags <SOLIDITY_CONTRACT>
```

### Compile

Compile the smart contracts with Hardhat:

```sh
$ yarn compile
```

### TypeChain

Compile the smart contracts and generate TypeChain artifacts:

```sh
$ yarn build
```

### Lint Solidity

Lint the Solidity code:

```sh
$ yarn lint:sol
```

### Lint TypeScript

Lint the TypeScript code:

```sh
$ yarn lint:ts
```

### Test

Run the Mocha tests:

```sh
$ yarn test
```

### Coverage

Generate the code coverage report:

```sh
$ yarn coverage
```

### Clean

Delete the smart contract artifacts, the coverage reports and the Hardhat cache:

```sh
$ yarn clean
```

### Interactive console

Enter in the interactive console, run the following command:

```sh
$ yarn console <NETWORK>
```

Get contract instace

```sh
> const Contract = await ethers.getContractAt(<TAG>, <ADDRESS>);
```

Function call of the contract instance is really straight forward

```sh
> await Contract.<function>();
```
