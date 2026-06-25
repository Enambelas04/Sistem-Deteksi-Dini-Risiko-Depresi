import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Overview from './pages/Overview.jsx'
import Detail from './pages/Detail.jsx'
import Riwayat from './pages/Riwayat.jsx'
import Chatbot from './pages/Chatbot.jsx'
import UjiPrediksi from './pages/UjiPrediksi.jsx'

export default function App() {
  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />
      <main className="flex-1 px-10 py-9 max-w-[1400px]">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/detail" element={<Detail />} />
          <Route path="/detail/:id" element={<Detail />} />
          <Route path="/riwayat" element={<Riwayat />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/uji-prediksi" element={<UjiPrediksi />} />
        </Routes>
      </main>
    </div>
  )
}
