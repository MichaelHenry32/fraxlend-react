import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getFraxlendMarketDetails, getFraxlendMarkets } from "./fraxlendAPI";
import { FraxlendInterface, FraxlendMarket } from "./fraxlendInterfaces";

export const fetchMarketsData = createAsyncThunk<FraxlendMarket[], void>(
    "fraxlend/fetchMarketsData",
    async () => {
        const resp = await getFraxlendMarkets();
        return resp;
    }
);

export const fetchMarketDetailData = createAsyncThunk(
    "fraxlend/fetchMarketDetailData",
    async (params: { fraxlendMarket: FraxlendMarket, userAddress: `0x${string}` }) => {
        const resp = await getFraxlendMarketDetails(params.fraxlendMarket, params.userAddress);
        return resp;
    }
);

const initialState: FraxlendInterface = {
    markets: {},
    marketDetails: {
    },
    status: "idle"
};

const fraxlendSlice = createSlice({
    name: "fraxlend",
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMarketsData.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchMarketsData.fulfilled, (state, action) => {
                state.status = "succeeded"
                state.markets = Object.fromEntries(action.payload.map(market => [market.pairAddress, market]));
            }).addCase(fetchMarketsData.rejected, (state, action) => {
                state.status = "rejected";
                console.log("Fetch markets failed: ", action)
            })
            .addCase(fetchMarketDetailData.pending, (state, action) => {
                const pairAddress = action.meta.arg.fraxlendMarket.pairAddress;
                if (!state.marketDetails[pairAddress]) {
                    state.marketDetails[pairAddress] = { user_address: action.meta.arg.userAddress, assetBalance: "0", sharesBalance: "0", status: "loading" };
                }
                state.marketDetails[pairAddress].status = "loading";
            })
            .addCase(fetchMarketDetailData.fulfilled, (state, action) => {
                const pairAddress = action.meta.arg.fraxlendMarket.pairAddress;
                if (action.payload === undefined) {
                    state.marketDetails[pairAddress] = {
                        ...state.marketDetails[pairAddress],
                        status: "rejected"
                    }
                } else {
                    state.marketDetails[pairAddress] = {
                        ...action.payload,
                        user_address: action.meta.arg.userAddress,
                        status: "succeeded"
                    }
                }
            })
    }
})

export default fraxlendSlice.reducer;