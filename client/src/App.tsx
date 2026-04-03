import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import CreateCard from './pages/CreateCard'
import Matches from './pages/Matches'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create" element={<CreateCard />} />
        <Route path="/matches" element={<Matches />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App