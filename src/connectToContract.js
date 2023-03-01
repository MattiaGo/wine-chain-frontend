//This new file contains a function that creates the JavaScript instance discussing with the smart contract.
import { abi } from "./constants";

import getWeb3 from "./getWeb3";
// export an instance of the smart contract that stores IPFS hash

async function connectToContract(contractAddress) {
  const web3 = await getWeb3();
  return new web3.eth.Contract(abi, contractAddress);
}
connectToContract();

export default connectToContract;
