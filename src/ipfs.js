import { create as ipfsHttpClient } from "ipfs-http-client";

const ipfs = ipfsHttpClient({
  host: "127.0.0.1",
  port: 5002,
  protocol: "http",
  /* headers: {
      authorization: auth,
    },
    */
});

export default ipfs;
