# wine-chain-solidity

Solidity smart contract for a wine blockchain

### Prerequisites

- Solc compiler
- Npm
- Node.js
- Ganache
- Metamask

### Installation

- Install the IPFS client following the instruction at https://www.npmjs.com/package/ipfs
- Clone the wine-chain-frontend folder from Github.
- From the wine-chain-frontend folder execute the command:

  ```bash
  npm install
  ```

- From a terminal session start the IPFS daemon:

  ```bash
  jsipfs daemon
  ```

- Check that HOST and PORT match the value at line 4-5 of the ipfs.js file in the wine-chain-frontend folder. Check also that the web gui provided by the terminal jsipfs session is reachable.

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.
