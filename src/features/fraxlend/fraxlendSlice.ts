import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getFraxlendMarkets } from "./fraxlendAPI";
import { FraxlendInterface, FraxlendMarket } from "./fraxlendInterfaces";

export const fetchMarketsData = createAsyncThunk<FraxlendMarket[], void>(
    "fraxlend/fetchMarketsData",
    async () => {
        const response = await getFraxlendMarkets();
        return response;
    }
);

const initialState: FraxlendInterface = {
    markets: {},
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
    }
})

export default fraxlendSlice.reducer;