import React, { useState } from "react";
import { Button, ProgressBar, Container } from "react-bootstrap";
import connectToContract from "../connectToContract";
import web3 from "web3";
import AddRemoveMultipleInputField from "./AddRemoveMultipleInputFields";

export default function CreateBatch({ contractAddress }) {
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [category, setCategory] = useState("");
  const [productID, setProductID] = useState("");
  const [productName, setProductName] = useState("");
  const [uom, setUoM] = useState("");
  const [quantity, setQuantity] = useState("");
  const [parentIDs, setParentsIDs] = useState([]);

  const toHex = (string) => {
    return web3.utils.asciiToHex(string);
  };

  const createAnotherBatch = () => {
    setLoading(false);
    setUploaded(false);
  };

  const createBatch = async (e) => {
    setLoading(true);
    e.preventDefault();
    let results;
    var arrayParentIDs = [];

    if (parentIDs.length !== 0) {
      parentIDs.forEach((parent) => {
        arrayParentIDs.push([
          parent.par_contract,
          web3.utils.padRight(toHex(parent.par_product_id), 64),
        ]);
      });
    }

    try {
      const account = window.ethereum.selectedAddress;

      const productContract = await connectToContract(contractAddress);

      //console.log("web3 sent back by getWeb3: ", web3);
      //console.log("using account in Metamask to pay:", account);
      //console.log("ethAddress:", ethAddress);

      await productContract.methods
        .publishBatch(
          toHex(category),
          toHex(productID),
          arrayParentIDs,
          toHex(productName),
          toHex(uom),
          quantity
        )
        .send({ from: account })
        .on("error", function (error, receipt) {
          console.log(error);
          if (error.code === 4001) {
            setLoading(false);
            setUploaded(false);
          }
        });

      setLoading(false);
      setUploaded(true);
    } catch (error) {
      console.log(error);
      alert(`Error while creating the batch`);
      setLoading(false);
      setUploaded(false);
    }
    return results;
  };

  const createButton = () => {
    if (web3.utils.isAddress(contractAddress) && category && productID) {
      if (!loading) {
        return (
          <div>
            {uploaded ? (
              <div>
                <h5>✅ Batch Created Successfully ✅</h5>
                <Button className="mb-3" onClick={createAnotherBatch}>
                  CREATE ANOTHER BATCH
                </Button>
              </div>
            ) : (
              <Button className="mb-3" onClick={createBatch}>
                CREATE BATCH
              </Button>
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
        <Button disabled className="mb-3">
          CREATE BATCH
        </Button>
      );
    }
  };

  return (
    <div>
      <h3> Create a batch for your step </h3>
      <div className="mystyle">
        <div className="mb-3">
          <label htmlFor="category" className="form-label">
            Product Category *
            <input
              required
              type="text"
              className="form-control"
              id="category"
              placeholder="Category"
              onChange={(e) => setCategory(e.target.value)}
            ></input>
          </label>
        </div>
        <label htmlFor="productID" className="form-label">
          Product ID *
          <input
            required
            id="productID"
            className="form-control"
            placeholder="Product ID"
            onChange={(e) => setProductID(e.target.value)}
          ></input>
        </label>
      </div>
      <div className="mystyle">
        <label>
          Contracts and Parent product IDs
          <AddRemoveMultipleInputField
            inputFields={parentIDs}
            setInputFields={setParentsIDs}
          />
        </label>
      </div>
      <div className="mystyle">
        <div className="mb-3">
          <label htmlFor="productName" className="form-label">
            Product Name
            <input
              required
              type="text"
              className="form-control"
              id="productName"
              placeholder="Product Name"
              onChange={(e) => setProductName(e.target.value)}
            ></input>
          </label>
        </div>

        <div className="mb-3">
          <label htmlFor="quantity" className="form-label">
            Quantity
            <input
              type="number"
              className="form-control"
              id="quantity"
              placeholder="Quantity"
              onChange={(e) => setQuantity(e.target.value)}
            ></input>
          </label>
        </div>

        <div className="mb-3">
          <label htmlFor="uom" className="form-label">
            Unit of measure
            <input
              type="text"
              className="form-control"
              id="uom"
              placeholder="Unit of measure"
              onChange={(e) => setUoM(e.target.value)}
            ></input>
          </label>
        </div>
      </div>
      <div>
        <label className="form-label">* mandatory fields</label>
      </div>
      {createButton()}
    </div>
  );
}
