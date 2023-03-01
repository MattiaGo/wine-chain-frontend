import React, { useState } from "react";
import { abi, bytecode } from "../constants";
import { Form, Button, ProgressBar, Container } from "react-bootstrap";
import getWeb3 from "../getWeb3";
import web3 from "web3";

export default function CreateContract() {
  //{ setAddress }
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [contractAddress, setContractAddress] = useState("");
  const [chainStep, setChainStep] = useState("");
  const [chainID, setChainID] = useState("");
  const [companyName, setCompanyName] = useState("");

  const toHex = (string) => {
    return web3.utils.asciiToHex(string);
  };
  const createAnotherContract = () => {
    setLoading(false);
    setUploaded(false);
  };

  const createProductContract = async (e) => {
    setLoading(true);
    e.preventDefault();
    let results;

    try {
      const web = await getWeb3();
      const account = window.ethereum.selectedAddress;
      let contract = new web.eth.Contract(abi);

      const args = [toHex(chainID), toHex(chainStep), toHex(companyName)];

      contract
        .deploy({
          data: bytecode,
          arguments: args,
        })
        .send({ from: account }, (err, transactionHash) => {
          console.log("Transaction Hash :", transactionHash);
        })
        .on("receipt", (receipt) => {
          // Contract Address will be returned here
          console.log("Contract Address:", receipt.contractAddress);
          setContractAddress(receipt.contractAddress);
          //setAddress(receipt.contractAddress);
          setLoading(false);
          setUploaded(true);
        })
        .on("confirmation", () => {})
        .on("error", function (error, receipt) {
          console.log(error);
          if (error.code === 4001) {
            setLoading(false);
            setUploaded(false);
          }
        });
    } catch (error) {
      console.log(error);
      alert(
        `Failed to load web3. Check that Metamask connected this page to a blockchain account. Else see browser console for error details.`
      );

      setLoading(false);
    }

    return results;
  };

  const createButton = () => {
    if (chainStep && chainID && companyName) {
      if (!loading) {
        return (
          <div>
            {uploaded ? (
              <div>
                <h5>✅ Contract Created Successfully ✅</h5>
                Contract available HERE CI ANDREBBE ETHERSCAN{" "}
                <a
                  href={contractAddress}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {contractAddress}
                </a>
                <Button className="mb-3" onClick={createAnotherContract}>
                  CREATE ANOTHER CONTRACT
                </Button>
              </div>
            ) : (
              <div>
                <Button
                  className="mb-3"
                  type="submit"
                  onClick={createProductContract}
                >
                  CREATE CONTRACT
                </Button>
              </div>
            )}
          </div>
        );
      } else {
        return (
          <Container>
            <h4>Creating Contract</h4>
            <ProgressBar animated now={100} />
            <h4>Please Wait ...</h4>
          </Container>
        );
      }
    } else {
      return (
        <div>
          <Button disabled className="mb-3" type="submit">
            CREATE CONTRACT
          </Button>
        </div>
      );
    }
  };

  return (
    <div>
      <h3> Create a Smart Contract for your Chain Step </h3>
      <Form onSubmit={createProductContract}>
        <div className="mystyle">
          <div className="mb-3">
            <label htmlFor="chainID" className="form-label">
              Chain ID*
              <input
                required
                type="text"
                className="form-control"
                id="chainID"
                onChange={(e) => setChainID(e.target.value)}
              ></input>
            </label>
          </div>
          <label htmlFor="selectID" className="form-label">
            Step of the Chain*
            <select
              id="selectID"
              className="form-select"
              aria-label="Default select example"
              value={chainStep}
              onChange={(e) => setChainStep(e.target.value)}
            >
              <option defaultValue={"-"}>-</option>
              <option value="Grape Grower">Grape Grower</option>
              <option value="Wine Producer">Wine Producer</option>
              <option value="Bulk Distributor">Bulk Distributor</option>
              <option value="Transit Cellar">Transit Cellar</option>
              <option value="Filler-Packer">Filler-Packer</option>
            </select>
          </label>
          <div className="mb-3">
            <label htmlFor="companyName" className="form-label">
              Company Name*
              <input
                required
                type="text"
                className="form-control"
                id="companyName"
                onChange={(e) => setCompanyName(e.target.value)}
              ></input>
            </label>
          </div>
        </div>

        <label className="form-label">* mandatory fields</label>

        {createButton()}
      </Form>
    </div>
  );
}
