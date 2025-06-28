import { createConfig, configureChains } from 'wagmi';
import { mainnet, polygon, arbitrum, optimism } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, polygon, arbitrum, optimism],
  [publicProvider()]
);

// Create connectors array with conditional WalletConnect
const connectors = [
  new MetaMaskConnector({ chains }),
  new InjectedConnector({
    chains,
    options: {
      name: 'Injected',
      shimDisconnect: true,
    },
  }),
];

// Only add WalletConnect if we have a valid project ID
const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

// Add WalletConnect connector only if we have a proper project ID
if (walletConnectProjectId && walletConnectProjectId !== 'your-project-id' && walletConnectProjectId !== 'demo-project-id') {
  connectors.push(
    new WalletConnectConnector({
      chains,
      options: {
        projectId: walletConnectProjectId,
        showQrModal: true,
      },
    })
  );
}

export const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export { chains };