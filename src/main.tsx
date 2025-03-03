import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import { system } from "@chakra-ui/react/preset";
import { ChakraProvider } from '@chakra-ui/react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ChakraProvider value={system}>
        <App />
      </ChakraProvider>
    </Provider>
  </React.StrictMode>
)
