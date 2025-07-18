import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ApolloProvider } from '@apollo/client';
// Corrected: Use a default import instead of a named import
import client from './lib/apollo';
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
)
