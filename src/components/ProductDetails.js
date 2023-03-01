import React, { useState } from "react";
import { Buffer } from "buffer";
import multihashes from "multihashes";
import { Button, Table, Container } from "react-bootstrap";
import connectToContract from "../connectToContract";
import web3 from "web3";
import MultipleFilesUpload from "./MultipleFilesUpload";

export default function ProductDetails({ contractAddress }) {
  const [show, setShow] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showProductIds, setShowProductIds] = useState(false);

  const [hashes, setHashes] = useState([]);

  const [category, setCategory] = useState("");
  const [productID, setProductID] = useState("");
  const [parentIDs, setParentIDs] = useState([]);
  const [productName, setProductName] = useState("");
  const [uom, setUoM] = useState("");
  const [quantity, setQuantity] = useState("");

  const [categories, setCategoriesforSelection] = useState([]);
  const [productIDs, setProductIDSforSelection] = useState([]);
  const [cat_products, setCat_Products] = useState([]);

  var cat_and_products = [];
  var a_categories = [];

  var a_productIDs = [];
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

  const handleCategorySelection = (evt) => {
    setCategory(evt.target.value);
    var tmp_array = cat_products;
    a_productIDs = tmp_array.filter((cat) => cat[0] === evt.target.value);
    setProductIDSforSelection(a_productIDs);
    setShowProductIds(true);
  };

  const getContractDetails = async () => {
    try {
      const productContract = await connectToContract(contractAddress);

      await productContract.getPastEvents(
        "emitBatch",
        {
          /*filter: {
          idx_category: [str]
        },*/
          fromBlock: "0",
          //topics: [, idx_category_filter, idx_prodID_filter],
        },
        function (error, events) {
          if (events) {
            events.forEach((event) => {
              var tmp_category = toString(event.returnValues.category);
              if (!a_categories.includes(tmp_category)) {
                a_categories.push(tmp_category);
              }
              cat_and_products.push([
                tmp_category,
                toString(event.returnValues.product_id),
              ]);
            });
          }
        }
      );

      if (a_categories.length !== 0) {
        setCategoriesforSelection(a_categories);
        setShowCategories(true);
      }
      if (cat_and_products !== 0) {
        setCat_Products(cat_and_products);
        setProductIDSforSelection(cat_and_products);
        //setShowProductIds(true);
      }
      //setHashes(logHash);
    } catch (error) {
      console.log(error);
      alert(`Error while retrieving contract details.`);
    }
  };

  const showCategorySelection = () => {
    return (
      <div className="mb-3">
        <label htmlFor="category" className="form-label">
          Select a Category
          <select
            id="category"
            className="form-select"
            aria-label="Default select example"
            onChange={handleCategorySelection}
          >
            <option key={category + "sel"} value={category}>
              {category}
            </option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>
      </div>
    );
  };
  const showProductIDsSelection = () => {
    if (productIDs.length !== 0) {
      return (
        <div className="mb-3">
          <label htmlFor="productID" className="form-label">
            Select a ProductID
            <select
              id="productID"
              className="form-select"
              aria-label="Default select example"
              onChange={(e) => {
                setProductID(e.target.value);
              }}
            >
              <option key={productID + "sel"} value={productID}>
                {productID}
              </option>
              {productIDs.map((pid) => (
                <option key={pid[1]} value={pid[1]}>
                  {pid[1]}
                </option>
              ))}
            </select>
          </label>
        </div>
      );
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
              <td>Category</td>
              <td>{category}</td>
            </tr>
            <tr>
              <td>Product ID </td>
              <td>{productID}</td>
            </tr>
            <tr>
              <td>Parent product contracts</td>
              <td>
                <ul>
                  {parentIDs.map((parent) => (
                    <li key={parent[1]}>
                      {"Contract: " + parent[0]}{" "}
                      <ul>
                        <li key={parent[1]}>
                          {"Product ID: " + toString(parent[1])}
                        </li>
                      </ul>
                    </li>
                  ))}{" "}
                </ul>
              </td>
            </tr>
            <tr>
              <td>Product Name</td>
              <td>{productName}</td>
            </tr>
            <tr>
              <td>Quantity</td>
              <td>{quantity}</td>
            </tr>
            <tr>
              <td>Unit of measure</td>
              <td>{uom}</td>
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
            Search for batch
          </Button>
        </div>
      );
    } else {
      return (
        <div className="mb-3">
          <Button disabled variant="outline-primary" size="lg">
            Search for batch
          </Button>
        </div>
      );
    }
  };

  const showSearchButton = () => {
    return (
      <div className="mb-3">
        <Button variant="outline-primary" size="lg" onClick={searchForBatch}>
          See Batch Details
        </Button>
      </div>
    );
  };

  const searchForBatch = async () => {
    try {
      const productContract = await connectToContract(contractAddress);

      var category_filter = toHex(category);
      var prodID_filter = toHex(productID);

      await productContract.getPastEvents(
        "emitBatch",
        {
          filter: {
            category: category_filter,
            product_id: prodID_filter,
          },
          fromBlock: "0",
          //topics: [, idx_category_filter, idx_prodID_filter],
        },
        function (error, events) {
          if (events) {
            events.forEach((event) => {
              setParentIDs(event.returnValues.parent);
              setProductName(toString(event.returnValues.product_name));
              setQuantity(event.returnValues.quantity);
              setUoM(toString(event.returnValues.uom));
            });
          }
        }
      );
      await productContract.getPastEvents(
        "emitHashes",
        {
          filter: {
            category: toHex(category),
            product_id: toHex(productID),
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

      await productContract.getPastEvents(
        "emitHashes",
        {
          filter: {
            category: toHex(category),
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

      var finalHashes = [];
      var ids = new Set();
      for (var i = 0; i < logHash.length; i++) {
        if (!ids.has(logHash[i][0])) {
          ids.add(logHash[i][0]);
          finalHashes.push(logHash[i]);
        }
      }

      setHashes(finalHashes);

      setShow(true);
    } catch (error) {
      console.log(error);
      alert(`Error while retrieving contract details.`);
      setShow(false);
    }
  };

  return (
    <Container>
      {showButton()}
      {showCategories ? showCategorySelection() : <div></div>}
      {showProductIds ? showProductIDsSelection() : <div></div>}
      {category && productID ? showSearchButton() : <div></div>}
      {show ? showTable() : <div></div>}
      {show ? (
        <div>
          <h3>Upload documents for this specific batch</h3>
          <MultipleFilesUpload
            contractAddress={contractAddress}
            document_category={category}
            product_id={productID}
          />
        </div>
      ) : (
        ""
      )}
    </Container>
  );
}
