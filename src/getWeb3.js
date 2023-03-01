//It contains a component that returns a JavaScript object.
//The key/value pairs of this object describe the API calls to a blockchain node that do transactions.
//This object is called a "Provider".
//The logic of these functions covers the cases where the dApp is called from
// - the new version of MetaMask,
// - an old version of MetaMask,
// - where the dApp runs without MetaMask on a local test blockchain network.

import Web3 from "web3";
export default getWeb3;

async function fromBrowser() {
  // checks which version of MetaMask is used and set the returned JSON accordingly
  let web3; // web3 scope is the whole function

  if (window.ethereum) {
    // Browser has new Metamask extension, we have to ask user permission
    web3 = new Web3(window.ethereum);
    // ask user permission for Metamask to connect to an account
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      // account is exposed
      return web3;
    } catch (error) {
      console.log("user refused connection", error);
    }
  } else if (window.web3) {
    // Browser has old Metamask extension. Account always exposed
    web3 = window.web3;
    return web3;
  } else {
    // Browser has no Metamask extension... try local blockchain
    const provider = new Web3.providers.HttpProvider("http://127.0.0.1:7545");
    web3 = new Web3(provider);
    return web3;
  }
}

async function getWeb3() {
  try {
    const web3 = await fromBrowser();
    return web3;
  } catch (error) {
    console.log(
      "Check that Metamask connected this page to a blockchain account",
      error
    );
  }
}

getWeb3();
