import React, { useState } from "react";
import { Buffer } from "buffer";
import multihashes from "multihashes";
import { Button, Table, Container } from "react-bootstrap";
import connectToContract from "../connectToContract";
import web3 from "web3";

export default function ContractDetails({ contractAddress }) {
  const [show, setShow] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [chainID, setChainID] = useState("");
  const [chainStep, setChainStep] = useState("");
  const [hashes, setHashes] = useState([]);
  var logHash = [];

  const argsToCid = (hashFunction, size, digest) => {
    const hashHex = hashFunction.slice(2) + size.slice(2) + digest.slice(2);
    const hashBytes = Buffer.from(hashHex, "hex");
    return multihashes.toB58String(hashBytes);
  };

  const toString = (hex) => {
    return web3.utils.hexToUtf8(hex);
  };
  const toHex = (string) => {
    return web3.utils.utf8ToHex(string);
  };

  const getContractDetails = async () => {
    try {
      const productContract = await connectToContract(contractAddress);

      await productContract.methods
        .i_company_name()
        .call(function (error, result) {
          setCompanyName(toString(result));
        });

      await productContract.methods.i_chain_id().call(function (error, result) {
        setChainID(toString(result));
      });

      await productContract.methods
        .i_chain_step()
        .call(function (error, result) {
          setChainStep(toString(result));
        });

      var category_filter = toHex("GENERIC");
      var prodID_filter = toHex("GENERIC");

      await productContract.getPastEvents(
        "emitHashes",
        {
          filter: {
            category: category_filter,
            product_id: prodID_filter,
          },
          fromBlock: "0",
          //topics: [, category_filter, prodID_filter],
        },
        function (error, events) {
          if (events.length !== 0) {
            events.forEach((event) => {
              event.returnValues.multi.forEach((single_multi) => {
                logHash.push([
                  single_multi.file_name,
                  argsToCid(
                    single_multi.hash_function,
                    single_multi.size,
                    single_multi.hash
                  ),
                ]);
              });
            });
          }
        }
      );

      setHashes(logHash);
      setShow(true);
    } catch (error) {
      console.log(error);
      alert(`Error while retrieving contract details.`);
      setShow(false);
    }
  };

  const showTable = () => {
    if (web3.utils.isAddress(contractAddress)) {
      return (
        <Table size="sm" bordered responsive>
          <thead>
            <tr>
              <th>Items</th>
              <th>Values</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Contract address </td>
              <td>{contractAddress}</td>
            </tr>
            <tr>
              <td>Chain ID</td>
              <td>{chainID}</td>
            </tr>
            <tr>
              <td>Step of the Chain </td>
              <td>{chainStep}</td>
            </tr>
            <tr>
              <td>Company Name </td>
              <td>{companyName}</td>
            </tr>
            <tr>
              <td>Document and Certifications</td>
              <td>
                {hashes.map((hash) => (
                  <li key={hash[1]}>
                    {hash[0]}
                    {" : "}
                    <a
                      href={
                        "http://127.0.0.1:5002/ipfs/bafybeif4zkmu7qdhkpf3pnhwxipylqleof7rl6ojbe7mq3fzogz6m4xk3i/#/ipfs/" +
                        hash[1]
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {hash[1]}
                    </a>
                  </li>
                ))}
              </td>
            </tr>
          </tbody>
        </Table>
      );
    }
  };

  const showButton = () => {
    if (web3.utils.isAddress(contractAddress)) {
      return (
        <div className="mb-3">
          <Button
            variant="outline-primary"
            size="lg"
            onClick={getContractDetails}
          >
            {" "}
            Get Contract Details
          </Button>
        </div>
      );
    } else {
      return (
        <div>
          <Button disabled variant="outline-primary" size="lg">
            {" "}
            Get Contract Details
          </Button>
        </div>
      );
    }
  };

  return (
    <Container>
      {showButton()}
      {show ? showTable() : ""}
    </Container>
  );
}
