import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ChatPage from './pages/ChatPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import LogPage from './pages/LogPage'
import RobotManagePage from './pages/RobotManagePage/index'
import ApiKeysPage from './pages/ApiKeysPage'
import CreateChatroomPage from './pages/CreateChatroomPage'
import CharacterCardEditor from './pages/CharacterCardEditor'
import Layout from './components/Layout'
import './index.css'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Standalone pages */}
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:roomId" element={<ChatPage />} />
        
        {/* Pages with Sidebar Layout */}
        <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
        <Route path="/admin" element={<Layout><AdminPage /></Layout>} />
        <Route path="/logs" element={<Layout><LogPage /></Layout>} />
        <Route path="/robots" element={<Layout><RobotManagePage /></Layout>} />
        <Route path="/api-keys" element={<Layout><ApiKeysPage /></Layout>} />
        <Route path="/create-chatroom" element={<Layout><CreateChatroomPage /></Layout>} />
        <Route path="/character-cards/:botId" element={<Layout><CharacterCardEditor /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
