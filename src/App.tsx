import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import { FraxlendMarketsList } from './features/fraxlend/FraxlendMarketsList'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <FraxlendMarketsList />
              </>
            }
          ></Route>
        </Routes>
      </div>
    </Router>
  )
}

export default App
