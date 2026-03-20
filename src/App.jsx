import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Setup from './pages/Setup'
import Swipe from './pages/Swipe'
import Live from './pages/Live'
import Match from './pages/Match'
import Join from './pages/Join'

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Setup />} />
          <Route path="/join/:sessionId" element={<Join />} />
          <Route path="/swipe/:sessionId" element={<Swipe />} />
          <Route path="/live/:sessionId" element={<Live />} />
          <Route path="/match/:sessionId" element={<Match />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}
