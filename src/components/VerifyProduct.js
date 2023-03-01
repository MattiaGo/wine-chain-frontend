import React, { useState } from "react";
import { Button, Table } from "react-bootstrap";
import { Buffer } from "buffer";
import web3 from "web3";
import { Link } from "react-router-dom";
import multihashes from "multihashes";
import connectToContract from "../connectToContract";

var listID = [];
var fatherContracts = [];
var logHash = [];

export default function VerifyProduct() {
  const [contractAddress, setContractAddress] = useState("");
  const [isContract, setIsContract] = useState("false");
  const [productID, setProductID] = useState("");
  const [show, setShow] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [chainStep, setChainStep] = useState("");
  const [hashes, setHashes] = useState([]);

  const [category, setCategory] = useState("");
  const [parentAddrID, setParentAddrID] = useState([]);
  const [productName, setProductName] = useState("");

  const [components, setComponents] = useState([]);

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

  const verifyButton = () => {
    if (isContract && contractAddress && productID) {
      return (
        <div>
          <Button
            className="mb-3"
            type="submit"
            onClick={() => {
              removeFromList(productID);
              getProductDetails();
            }}
          >
            SEE PRODUCT DETAILS
          </Button>
        </div>
      );
    } else {
      return (
        <div>
          <Button disabled className="mb-3" type="submit">
            SEE PRODUCT DETAILS
          </Button>
        </div>
      );
    }
  };

  const handleContractAddress = (evt) => {
    if (web3.utils.isAddress(evt.target.value)) {
      setContractAddress(evt.target.value);
      setIsContract(true);
    } else {
      setIsContract(false);
    }
  };

  const getHashes = async (_productContract, _arrayTo, _category, _prod_id) => {
    try {
      await _productContract.getPastEvents(
        "emitHashes",
        {
          filter: {
            category: toHex(_category),
            product_id: toHex(_prod_id),
          },
          fromBlock: "0",
          //topics: [, category_filter, prodID_filter],
        },

        function (error, events) {
          events.forEach((event) => {
            event.returnValues.multi.forEach((single_multi) => {
              _arrayTo.push([
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
      );
    } catch (error) {
      console.log(error);
      alert(`Error while retrieving contract details.`);
    }
  };

  const filterArray = (_array, _filter_col) => {
    var finalHashes = [];
    var ids = new Set();
    for (var i = 0; i < _array.length; i++) {
      if (!ids.has(_array[i][_filter_col])) {
        ids.add(_array[i][_filter_col]);
        finalHashes.push(_array[i]);
      }
    }
    return finalHashes;
  };

  const getProductDetails = async () => {
    logHash = [];

    fatherContracts = [];
    setComponents([]);

    try {
      const productContract = await connectToContract(contractAddress);

      var companyInfo = await getCompanyInfo(contractAddress);

      setChainStep(companyInfo[0].chainStep);
      setCompanyName(companyInfo[0].companyName);

      await productContract.getPastEvents(
        "emitBatch",
        {
          filter: {
            product_id: toHex(productID),
          },
          fromBlock: "0",
          //topics: [, idx_category_filter, idx_prodID_filter],
        },
        function (error, events) {
          events.forEach((event) => {
            setParentAddrID(event.returnValues.parent);
            setProductName(toString(event.returnValues.product_name));
          });
        }
      );

      await getHashes(productContract, logHash, category, productID);
      await getHashes(productContract, logHash, category, "GENERIC");

      const finalHashes = filterArray(logHash, 0);

      setHashes(finalHashes);
      setShow(true);
    } catch (error) {
      console.log(error);
      alert(`Error while retrieving contract details.`);
      setShow(false);
    }
  };

  const getCompanyInfo = async (_parentAddrID) => {
    let contractsAddresses = [];
    let stepArray = [];

    if (_parentAddrID.length !== 0) {
      if (_parentAddrID[0].length === 1) {
        contractsAddresses.push(_parentAddrID);
      } else {
        let ids = new Set();
        for (let i = 0; i < _parentAddrID.length; i++) {
          if (!ids.has(_parentAddrID[i].parent_contract)) {
            ids.add(_parentAddrID[i].parent_contract);
            contractsAddresses.push(_parentAddrID[i].parent_contract);
          }
        }
      }
    }

    //per ogni address e id prodotto che ho segnato come parent tiro fuori le informazioni
    for (let index = 0; index < contractsAddresses.length; index++) {
      let companyName, chainStep;

      const productContract = await connectToContract(
        contractsAddresses[index]
      );

      await productContract.methods
        .i_company_name()
        .call(function (error, result) {
          companyName = toString(result);
        });

      await productContract.methods
        .i_chain_step()
        .call(function (error, result) {
          chainStep = toString(result);
        });

      let stepNumber;
      switch (chainStep) {
        case "Grape Grower":
          stepNumber = 1;
          break;
        case "Wine Producer":
          stepNumber = 2;
          break;
        case "Bulk Distributor":
          stepNumber = 3;
          break;
        case "Filler-Packer":
          stepNumber = 4;
          break;
        case "Distributor":
          stepNumber = 5;
          break;
        default:
          stepNumber = 0;
          break;
      }

      stepArray.push({
        stepNumber: stepNumber,
        address: contractsAddresses[index],
        chainStep,
        companyName,
      });
    }

    return stepArray;
  };

  const getProductStep = async (_childID, _parentAddrID) => {
    try {
      var productsInfo = [];
      var stepArray = await getCompanyInfo(_parentAddrID);

      for (let index = 0; index < _parentAddrID.length; index++) {
        let parent_prods_info;
        let parent_hash = [];
        let parent_parent_info = [];
        let parent_hash_per_id = [];

        const productContract = await connectToContract(
          _parentAddrID[index].parent_contract
        );

        await productContract.getPastEvents(
          "emitBatch",
          {
            filter: {
              product_id: toHex(toString(_parentAddrID[index].product_id)),
            },
            fromBlock: "0",
            //topics: [, idx_category_filter, idx_prodID_filter],
          },
          function (error, events) {
            events.forEach((event) => {
              //sarà sempre 1 solo
              parent_prods_info = {
                category: event.returnValues.category,
                product_id: event.returnValues.product_id,
                product_name: event.returnValues.product_name,
              };

              //di nuovo il parent a salire
              parent_parent_info.push(event.returnValues.parent);
            });
          }
        );

        await getHashes(
          productContract,
          parent_hash,
          toString(parent_prods_info.category),
          toString(parent_prods_info.product_id)
        );
        await getHashes(
          productContract,
          parent_hash,
          toString(parent_prods_info.category),
          "GENERIC"
        );

        //DA CAMBIARE LO 0 COL 1 (HASH)
        parent_hash_per_id = filterArray(parent_hash, 0);

        productsInfo.push({
          address: _parentAddrID[index].parent_contract,
          id: toString(_parentAddrID[index].product_id),
          parent_prods_info,
          parent_hash_per_id,
          parent_parent_info,
        });
      }

      for (let index = 0; index < stepArray.length; index++) {
        fatherContracts.push([
          stepArray[index].stepNumber,
          _childID,
          stepArray[index],
          [],
        ]);
        const f_length = fatherContracts.length;
        for (let index2 = 0; index2 < productsInfo.length; index2++) {
          if (productsInfo[index2].address === stepArray[index].address) {
            const element = productsInfo[index2];
            delete element.address;
            fatherContracts[f_length - 1][3] = [
              ...fatherContracts[f_length - 1][3],
              element,
            ];
          }
        }
      }
      for (let idx4 = 0; idx4 < productsInfo.length; idx4++) {
        if (productsInfo[idx4].parent_parent_info.length !== 0) {
          await getProductStep(
            toString(productsInfo[idx4].parent_prods_info.product_id),
            productsInfo[idx4].parent_parent_info[0]
          );
        }
      }
      fatherContracts = fatherContracts.sort((a, b) => a[0] - b[0]);
      console.log(fatherContracts);
      setComponents(...components, fatherContracts);
    } catch (error) {
      console.log(error);
      alert(`Error while retrieving parent details.`);
      setShow(false);
    }
  };

  const showTable = (
    _contractAddress,
    _chainStep,
    _companyName,
    _category,
    _productID,
    _productName,
    _hashes
  ) => {
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
            <td>Smart Contract Address</td>
            <td>{_contractAddress}</td>
          </tr>
          <tr>
            <td>Step of the chain</td>
            <td>{_chainStep}</td>
          </tr>
          <tr>
            <td>Company Name</td>
            <td>{_companyName}</td>
          </tr>
          <tr>
            <td>Category</td>
            <td>{_category}</td>
          </tr>
          <tr>
            <td>Product ID </td>
            <td>{_productID}</td>
          </tr>
          <tr>
            <td>Product Name</td>
            <td>{_productName}</td>
          </tr>
          <tr>
            <td>Document and Certifications</td>
            <td>
              {_hashes.map((hash) => (
                <li key={hash[0]}>
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
  };

  const addToList = (_prod_id) => {
    listID.push(_prod_id);
  };

  const removeFromList = (_prod_id) => {
    listID = listID.filter((e) => e !== _prod_id);
  };

  const goToProductID = (id) => {
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
  };
  const showStepInfo = (_stepInfo, index) => {
    return (
      <div className="mystyle2" key={index}>
        <hr className="border" />
        {_stepInfo[3].map((parent) => {
          return (
            <div
              className="ms-3"
              id={toString(parent.parent_prods_info.product_id)}
              key={toString(parent.parent_prods_info.product_id)}
            >
              {showTable(
                _stepInfo[2].address,
                _stepInfo[2].chainStep,
                _stepInfo[2].companyName,
                toString(parent.parent_prods_info.category),
                toString(parent.parent_prods_info.product_id),
                toString(parent.parent_prods_info.product_name),
                parent.parent_hash_per_id
              )}
            </div>
          );
        })}
        <div className="w-25 ms-3 d-flex align-items-center">
          <button
            className="btn btn-outline-success "
            type="button"
            onClick={() => {
              goToProductID(_stepInfo[1]);
            }}
          >
            Child Product ID (Next Step): {_stepInfo[1]}
          </button>
        </div>
        <hr className="border" />
      </div>
    );
  };

  return (
    <div>
      <div className="mb-3">
        <Link to="/">
          <Button variant="warning" size="lg">
            Chain DApp
          </Button>
        </Link>
      </div>
      <div className="mystyle">
        <div>
          <label htmlFor="contractAddress" className="form-label">
            Contract Address *
          </label>
          <input
            type="text"
            className="form-control"
            id="contractAddress"
            onChange={handleContractAddress} //{(e) => setEthAddress(e.target.value)}
            //value={ethAddress}
            //placeholder=""
          />
          {isContract ? (
            <p style={{ color: "red" }}></p>
          ) : (
            <p style={{ color: "red" }}>
              The inserted address is not a product contract
            </p>
          )}
        </div>
        <div>
          <label htmlFor="category" className="form-label">
            Category *
            <input
              required
              type="text"
              className="form-control"
              id="category"
              onChange={(e) => setCategory(e.target.value)}
            ></input>
          </label>
        </div>
        <div>
          <label htmlFor="productID" className="form-label">
            Product ID *
            <input
              required
              type="text"
              className="form-control"
              id="productID"
              onChange={(e) => setProductID(e.target.value)}
            ></input>
          </label>
        </div>
      </div>
      <label className="form-label">* mandatory fields</label>
      {verifyButton()}
      {show ? (
        <div id={productID}>
          {showTable(
            contractAddress,
            chainStep,
            companyName,
            category,
            productID,
            productName,
            hashes
          )}
          {parentAddrID.length !== 0 ? (
            <Button
              key={productID}
              hidden={listID.includes(productID) ? true : false}
              className="mb-3"
              type="submit"
              onClick={() => {
                addToList(productID);
                getProductStep(productID, parentAddrID);
              }}
            >
              SEE PRODUCT HISTORY
            </Button>
          ) : (
            ""
          )}
        </div>
      ) : (
        ""
      )}
      {components.length !== 0 ? <h1>LA FILIERA</h1> : ""}
      {components.map((item, index) => {
        return showStepInfo(item, index);
      })}
    </div>
  );
}
