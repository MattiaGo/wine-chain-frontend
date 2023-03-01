import React, { useState } from "react";
import {
  Form,
  ListGroup,
  Badge,
  Button,
  ProgressBar,
  Container,
} from "react-bootstrap";
import all from "it-all";
import "bootstrap/dist/css/bootstrap.min.css";
//import getWeb3 from "../getWeb3";
import connectToContract from "../connectToContract";
import multihashes from "multihashes";
import { Buffer } from "buffer";
import web3 from "web3";
import ipfs from "../ipfs";

export default function MultipleFilesUpload({
  contractAddress,
  document_category,
  product_id,
}) {
  const [files, setFiles] = useState([]);
  const [filesUrl, setFilesUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const toHex = (string) => {
    return web3.utils.asciiToHex(string);
  };

  const cidToArgs = (cid) => {
    const mh = multihashes.fromB58String(Buffer.from(cid));
    return {
      hash_function: "0x" + Buffer.from(mh.slice(0, 1)).toString("hex"),
      size: "0x" + Buffer.from(mh.slice(1, 2)).toString("hex"),
      hash: "0x" + Buffer.from(mh.slice(2)).toString("hex"),
    };
  };

  const uploadFiles = async () => {
    if (web3.utils.isAddress(contractAddress)) {
      let fileObjectsArray = Array.from(files).map((file) => {
        return {
          path: file.name,
          content: file,
        };
      });

      const results = await all(
        ipfs.addAll(fileObjectsArray, { wrapWithDirectory: true })
      );

      var arrayHashes = [];
      var CIDarray = [];
      results.forEach(function (i, idx, array) {
        if (idx !== array.length - 1) {
          var tmp = cidToArgs(results[idx].cid.toString());
          arrayHashes.push([results[idx].path, results[idx].cid.toString()]);
          CIDarray.push([
            results[idx].path.toString(),
            tmp.hash_function,
            tmp.size,
            tmp.hash,
          ]);
        }
      });

      try {
        // get the blockchain interface
        //const web3 = await getWeb3();
        // bring in user's Metamask account address
        const account = window.ethereum.selectedAddress;

        const productContract = await connectToContract(contractAddress);
        //const ethAddress = await productContract.options.address;

        //console.log("web3 sent back by getWeb3: ", web3);
        //console.log("using account in Metamask to pay:", account);
        //console.log("ethAddress storing the IPFS hash:", ethAddress);

        const receipt = await productContract.methods
          .storeHash(
            toHex(document_category),
            toHex(product_id),
            CIDarray
          )
          .send({ from: account })
          .on("receipt", function (receipt) {
            console.log(receipt);
          })
          .on("error", function (error, receipt) {
            console.log(error);
            if (error.code === 4001) {
              setLoading(false);
              setUploaded(false);
            }
          });

        console.log("receipt as returned by smart contract:", receipt);
      } catch (error) {
        console.log(error);
        alert(`Error while uploading files or hashes to the contract`);
        setLoading(false);
      }
      return results;
    } else {
      return null;
    }
  };

  const returnFilesUrl = async (e) => {
    setLoading(true);
    e.preventDefault();

    const results = await uploadFiles(files);
    if (results) {
      const length = results.length;
      const FilesHash = results[length - 1].cid;
      const FilesUrl =
        "http://127.0.0.1:5002/ipfs/bafybeif4zkmu7qdhkpf3pnhwxipylqleof7rl6ojbe7mq3fzogz6m4xk3i/#/ipfs/" +
        FilesHash;
      setFilesUrl(FilesUrl);
      setUploaded(true);
    }
    setLoading(false);
  };

  const filesAndUploadButton = () => {
    if (!loading) {
      return (
        <div>
          {uploaded ? (
            <div>
              <h5>✅ Files Uploaded Successfully ✅</h5>
              IPFS Files Folder available{" "}
              <a href={filesUrl} target="_blank" rel="noopener noreferrer">
                HERE
              </a>
            </div>
          ) : (
            <div>
              <ListGroup className="mb-3">
                {Array.from(files).map((file) => {
                  return (
                    <ListGroup.Item
                      as="li"
                      className="d-flex justify-content-between align-items-start"
                      key={file.name}
                    >
                      <div className="ms-2 me-auto">{file.name}</div>
                      <Badge pill>{file.size} kb</Badge>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>

              {web3.utils.isAddress(contractAddress) && files.length !== 0 ? (
                <Button className="mb-3" type="submit">
                  UPLOAD FILES
                </Button>
              ) : (
                <Button disabled className="mb-3" type="submit">
                  UPLOAD FILES
                </Button>
              )}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <Container>
          <h4>Uploading Files</h4>
          <ProgressBar animated now={100} />
          <h4>Please Wait ...</h4>
        </Container>
      );
    }
  };

  return (
    <div>
      <Form onSubmit={returnFilesUrl}>
        <Form.Control
          required
          type="file"
          multiple
          onChange={(e) => {
            setUploaded(false);
            setFiles(e.target.files);
          }}
          className="mb-3"
        />
        {filesAndUploadButton()}
      </Form>
    </div>
  );
}
