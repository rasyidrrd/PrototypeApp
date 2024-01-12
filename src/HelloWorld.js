import React, { useEffect, useState } from 'react';
import { TestContractContract, connectWallet, updateMessage, loadCurrentMessage, getCurrentWalletConnected, resetMetamaskConnection } from './util/interact';

const TestContract = () => {
  const [walletAddress, setWallet] = useState('');
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('No connection to the network.');
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const initializeApp = async () => {
      // Reset Metamask connection when the component mounts
      const resetResult = await resetMetamaskConnection();
      console.log(resetResult.status);

      // Connect to Metamask
      const connectResult = await connectWallet();
      setWallet(connectResult.address);
      setStatus(connectResult.status);

      // Fetch current message
      const msg = await loadCurrentMessage();
      setMessage(msg);

      // Set up event listeners
      addSmartContractListener();
      addWalletListener();
    };

    initializeApp();
  }, []);

  const addSmartContractListener = () => {
    TestContractContract.events.UpdatedMessages({}, (error, data) => {
      if (error) {
        setStatus('😥 ' + error.message);
      } else {
        setMessage(data.returnValues[1]);
        setNewMessage('');
        setStatus('🎉 Your message has been updated!');
      }
    });
  };

  const addWalletListener = () => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus('👆🏽 Write a message in the text-field above.');
        } else {
          setWallet('');
          setStatus('🦊 Connect to Metamask using the top right button.');
        }
      });
    } else {
      setStatus(
        <p>
          🦊{' '}
          <a target="_blank" href={`https://metamask.io/download`}>
            You must install Metamask, a virtual Ethereum wallet, in your browser.
          </a>
        </p>
      );
    }
  };

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();
    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };

  const onUpdatePressed = async () => {
    const { status } = await updateMessage(walletAddress, newMessage);
    setStatus(status);
  };

  return (
    <div id="container" style={styles.container}>
      <button id="resetButton" style={styles.walletButton} onClick={resetMetamaskConnection}>
        Reset Metamask Connection
      </button>
      
      <button id="walletButton" style={styles.walletButton} onClick={connectWalletPressed}>
        {walletAddress.length > 0 ? (
          `Connected: ${String(walletAddress).substring(0, 6)}...${String(walletAddress).substring(38)}`
        ) : (
          <span>Connect Wallet</span>
        )}
      </button>

      <h2 style={styles.heading}>Current Message:</h2>
      <p style={styles.message}>{message}</p>

      <h2 style={styles.heading}>New Message:</h2>

      <div>
        <input
          type="text"
          placeholder="Update the message in your smart contract."
          onChange={(e) => setNewMessage(e.target.value)}
          value={newMessage}
          style={styles.input}
        />
        <p id="status" style={styles.status}>
          {status}
        </p>

        <button id="publish" onClick={onUpdatePressed} style={styles.publishButton}>
          Update
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#ffe6f2', // Light pink background color
    borderRadius: '15px',
  },
  logo: {
    width: '100px',
    height: '100px',
    marginBottom: '20px',
  },
  walletButton: {
    padding: '10px',
    cursor: 'pointer',
    backgroundColor: '#ff33cc', // Pink button color
    color: '#fff', // White text color
    borderRadius: '8px',
    border: 'none',
    marginBottom: '20px',
    fontSize: '16px',
  },
  heading: {
    paddingTop: '20px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ff33cc', // Pink heading color
  },
  message: {
    color: '#ff3399', // Darker pink message color
  },
  input: {
    height: '40px',
    borderColor: '#ff33cc', // Pink border color
    borderWidth: '2px',
    marginBottom: '10px',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '16px',
  },
  status: {
    marginBottom: '10px',
    color: '#ff0000', // Red status color
    fontSize: '14px',
  },
  publishButton: {
    padding: '10px',
    cursor: 'pointer',
    backgroundColor: '#ff33cc', // Pink button color
    color: '#fff', // White text color
    borderRadius: '8px',
    border: 'none',
    marginBottom: '20px',
    fontSize: '16px',
  },
};

export default TestContract;
