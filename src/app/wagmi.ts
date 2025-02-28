import { http, createConfig } from 'wagmi';
import { fraxtal } from 'wagmi/chains';

// Override the RPC URL for fraxtal chain
const localFraxtal = {
    ...fraxtal,
    rpcUrls: {
        default: { http: ['http://localhost:8545'] },
        public: { http: ['http://localhost:8545'] },
    }
};

export const config = createConfig({
    chains: [localFraxtal],
    transports: {
        [localFraxtal.id]: http(),
    },
});