import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import ConversationPage from './pages/ConversationPage'
import EndCompletePage from './pages/EndCompletePage'
import { AccessibilityProvider } from './context/AccessibilityContext'

// 라우터 = "주소(URL)마다 어떤 화면을 보여줄지" 정하는 표입니다.
// 지금은 화면이 3개뿐이라 단순하지만, 화면이 늘어나도 이 파일에 한 줄씩만 추가하면 됩니다.
function App() {
  return (
    <AccessibilityProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/conversation" element={<ConversationPage />} />
          <Route path="/end" element={<EndCompletePage />} />
        </Routes>
      </BrowserRouter>
    </AccessibilityProvider>
  )
}

export default App
