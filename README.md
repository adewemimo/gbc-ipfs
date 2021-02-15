# A smart contract that uses IPFS (InterPlanetary File System) 
The code allows any document to be uploaded to IPFS and uses the hash of the document to retrieve the document. 

The InterPlanetary File System (IPFS) is a protocol and peer-to-peer network for storing and sharing data in a distributed file system. [link to IPFS!](https://ipfs.io/#why)


## To run the program
* Install IPFS
* Run IPFS. You can use $ ipfs daemon --writable = True
* access ipfs web interface web interface using [https://127.0.01:5001/webui](https://127.0.01:5001/webui)
* Launch ganache. run $ ganache-cli
* compile and deploy ipfs.sol in remix. deploy with **Web2 Provider** environment
* change the contract address in **SmartContractConfig.js** with the contract address of the smart contract you just deployed
* run project with `npm start` or `yarn start`

