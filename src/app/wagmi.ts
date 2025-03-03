import { http } from 'wagmi';
import { fraxtal } from 'wagmi/chains';
import { getDefaultConfig } from "@rainbow-me/rainbowkit";


// Override the RPC URL for fraxtal chain
const localFraxtal = {
    ...fraxtal,
    rpcUrls: {
        default: { http: ['http://localhost:8545'] },
        public: { http: ['http://localhost:8545'] },
    }
};

export const config = getDefaultConfig({
    appName: "FraxlendHelpers",
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
    chains: [localFraxtal],
    transports: {
        [localFraxtal.id]: http('http://localhost:8545'),
    },
});