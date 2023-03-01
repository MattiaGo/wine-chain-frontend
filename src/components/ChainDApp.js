import "../App.css";

import React, { useState } from "react";
import MultipleFilesUpload from "./MultipleFilesUpload";
import CreateContract from "./CreateContract";
import ContractDetails from "./ContractDetails";
import ProductDetails from "./ProductDetails";
import CreateBatch from "./CreateBatch";

import { Button } from "react-bootstrap";
import web3 from "web3";
import { Link } from "react-router-dom";

function ChainDApp() {
  const [contractAddress, setContractAddress] = useState("");
  const [isContract, setIsContract] = useState("false");

  const [categoryForUpload, setCategoryForUpload] = useState("");

  const handleContractAddress = (evt) => {
    if (web3.utils.isAddress(evt.target.value)) {
      setContractAddress(evt.target.value);
      setIsContract(true);
    } else {
      setIsContract(false);
    }
  };

  const errorContractMessage = () => {
    return isContract ? (
      <p style={{ color: "red" }}></p>
    ) : (
      <p style={{ color: "red" }}>
        The inserted address is not a product contract
      </p>
    );
  };

  return (
    <div className="mb-3">
      <Link to="/verify">
        <div className="mb-3">
          <Button variant="warning" size="lg">
            Verify a Product
          </Button>
        </div>
      </Link>

      <CreateContract />

      <hr />
      <h1> Interact with a Smart Contract </h1>
      <div className="mb-3">
        <label htmlFor="contractAddress" className="form-label">
          Smart Contract Address
        </label>
        <input
          type="text"
          className="form-control"
          id="contractAddress"
          placeholder="Smart Contract Address"
          onChange={handleContractAddress}
        />
        {errorContractMessage()}
      </div>

      <h3>See Smart Contract details</h3>
      <ContractDetails contractAddress={contractAddress} />

      <h3>Upload documents</h3>
      <MultipleFilesUpload
        contractAddress={contractAddress}
        document_category="GENERIC"
        product_id="GENERIC"
      />

      <hr />

      <h3> Upload Documents and Certifications for a product Category </h3>
      <div className="mb-3">
        <label htmlFor="category" className="form-label">
          Category
        </label>
        <input
          type="text"
          className="form-control"
          id="category"
          onChange={(e) => setCategoryForUpload(e.target.value)}
          placeholder="Category Name"
        />
      </div>

      <MultipleFilesUpload
        contractAddress={contractAddress}
        document_category={categoryForUpload}
        product_id="GENERIC"
      />

      <hr />
      <CreateBatch contractAddress={contractAddress} />
      <hr />

      <h3> See Batch Details </h3>

      <ProductDetails contractAddress={contractAddress} />
    </div>
  );
}

export default ChainDApp;
