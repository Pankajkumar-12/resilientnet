import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { EmergencyProvider } from "./context/EmergencyContext";
import './index.css'
import App from './App.jsx'
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";


createRoot(document.getElementById('root')).render(
  <StrictMode>
   <EmergencyProvider>
    <App />
</EmergencyProvider>
  </StrictMode>,
)
