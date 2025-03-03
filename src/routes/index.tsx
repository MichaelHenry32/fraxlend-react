import { Route, Routes } from "react-router-dom";
import { FraxlendMarketsList } from "../components/FraxlendMarketsList";
import FraxlendMarketDetail from "../components/FraxlendMarketDetail";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/markets" element={<FraxlendMarketsList />} />
            <Route path="/markets/:pairAddress" element={<FraxlendMarketDetail />} />
        </Routes>
    )
}

export default AppRoutes;