import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes'; // Import your routes file
import { ConnectButton } from '@rainbow-me/rainbowkit';

function App() {
  return (
    <BrowserRouter>
      <ConnectButton />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;