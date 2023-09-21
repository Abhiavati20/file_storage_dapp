import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import "@rainbow-me/rainbowkit/styles.css"

import { getDefaultWallets,RainbowKitProvider } from '@rainbow-me/rainbowkit';

import { configureChains,createClient,WagmiConfig} from 'wagmi';

import {sepolia} from "wagmi/chains"

import { alchemyProvider } from "wagmi/providers/alchemy"
import { publicProvider } from "wagmi/providers/public";

import env from "react-dotenv"

console.log("env", process.env.ALCHEMY_API_KEY)
const {chains,provider} = configureChains(
  [sepolia],
  [
    alchemyProvider({apiKey:process.env.ALCHEMY_API_KEY}),
    publicProvider()
  ]
);



const projectId = 'c3ea50e7e0a53b784645b2fadc829aeb';

// const { wallets } = getDefaultWallets({
//   appName:"FileStorageDapp",
//   projectId,
//   chains
// });
const { connectors } = getDefaultWallets({
  appName: "FileStorageDapp",
  projectId,
  chains,
});

const wagmiClient = createClient({
  autoConnect:true,
  connectors,
  provider
})

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <App />
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
