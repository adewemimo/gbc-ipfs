//import logo from './logo.svg';
import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import { url, contractAddress, abi } from './SmartContractConfig';
import ipfs from './ipfs';

var contractInstance;
var accounts;
var provider;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accounts: [],
      ipfsHash: null,
      buffer: '',
      ethAddress: '',
      blockNumber: '',
      transactionHash: '',
      gasUsed: '',
      txReceipt: '',
      imageUrl: '',
    };
  }

  componentDidMount() {
    this.loadBlockchainData();
  }

  async loadBlockchainData() {
    provider = new Web3(new Web3.providers.HttpProvider(url));
    contractInstance = new provider.eth.Contract(abi, contractAddress);
  }

  captureFile = event => {
    event.stopPropagation();
    event.preventDefault();
    const file = event.target.files[0];
    let reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => this.convertToBuffer(reader);
  };

  convertToBuffer = async reader => {
    //file is converted to a buffer for upload to IPFS
    const buffer = await Buffer.from(reader.result);
    //set state for this buffer
    this.setState({ buffer });
  };

  //onClick
  onClick = async () => {
    try {
      this.setState({ blockNumber: 'waiting..' });
      this.setState({ gasUsed: 'waiting...' });

      //get Transaction Receipt in console on click
      await provider.eth.getTransactionReceipt(
        this.state.transactionHash,
        (err, txReceipt) => {
          console.log(err, txReceipt);
          this.setState({ txReceipt });
        }
      );

      //await for getTransactionReceipt
      await this.setState({ blockNumber: this.state.txReceipt.blockNumber });
      await this.setState({ gasUsed: this.state.txReceipt.gasUsed });
    } catch (error) {
      console.log(error);
    }
  };

  onSubmit = async event => {
    event.preventDefault();
    //Ganache account addresses
    accounts = await provider.eth.getAccounts();
    this.setState({ accounts: accounts });

    console.log('Sending account address from Ganache: ' + accounts[0]);

    //obtain contract address
    this.setState({ ethAddress: contractAddress });

    //save document to IPFS,return its hash#, and set hash# to state
    await ipfs.add(this.state.buffer, (err, ipfsHash) => {
      console.log(err, ipfsHash);
      //setState by setting ipfsHash to ipfsHash[0].hash
      this.setState({ ipfsHash: ipfsHash[0].hash });

      // call Ethereum contract method "sendHash" to send IPFS hash to etheruem smart contract
      //return the transaction hash from the ethereum contract
      contractInstance.methods.sendHash(this.state.ipfsHash).send(
        {
          from: accounts[0],
        },
        (error, transactionHash) => {
          console.log(transactionHash);
          this.setState({ transactionHash });
        }
      );
    });
  };

  //Get IPFS document hash from smart contract to display file from IPFS
  displayFile = async event => {
    event.preventDefault();
    const hashFile = await contractInstance.methods.getHash().call();
    const imageURL = `http://localhost:8080/ipfs/${hashFile}`;
    this.setState({ imageUrl: imageURL });
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1> Interfacing with IPFS using Ethereum and React App </h1>
        </header>
        <hr />
        <section>
          <h2> Choose file to send to IPFS </h2>
          <form onSubmit={this.onSubmit}>
            <input
              type="file"
              onChange={this.captureFile}
            />
            <button type="submit">Send</button>
          </form>
          <hr />
          <button onClick={this.onClick}> Get Transaction Receipt </button>
          <table>
            <thead>
              <tr>
                <th>Transaction Details</th>
                <th>Results</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>IPFS Hash stored on Ethereum Smart Contract</td>
                <td>{this.state.ipfsHash}</td>
              </tr>
              <tr>
                <td>Ethereum Contract Address</td>
                <td>{this.state.ethAddress}</td>
              </tr>
              <tr>
                <td>Transaction Hash </td>
                <td>{this.state.transactionHash}</td>
              </tr>
              <tr>
                <td>Block Number</td>
                <td>{this.state.blockNumber}</td>
              </tr>
              <tr>
                <td>Gas Used</td>
                <td>{this.state.gasUsed}</td>
              </tr>
            </tbody>
          </table>
          <hr />
          <div>
            <h2> Retrieve file from IPFS </h2>
            <button onClick={this.displayFile}> Display Document </button>
          </div>
          <div>
            <img src={this.state.imageUrl} alt=""></img>
          </div>
        </section>
      </div>
    );
  } //render
} //App
export default App;
