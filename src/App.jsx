import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import PlayPage from "./pages/PlayPage";
import PlayChemiPage from "./pages/PlayChemiPage";
import PlayMyPage from "./pages/PlayMyPage";
import BusinessPage from "./pages/BusinessPage";
import BusinessContrPage from "./pages/BusinessContrPage";
import BusinessMyPage from "./pages/BusinessMyPage";
import CreditsPage from "./pages/CreditsPage";
import ResultPage from "./pages/ResultPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import ForgetPasswordPage from "./pages/ForgetPasswordPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="/play/chemi" element={<PlayChemiPage />} />
        <Route path="/play/mypage" element={<PlayMyPage />} />
        <Route path="/business" element={<BusinessPage />} />
        <Route path="/business/contr" element={<BusinessContrPage />} />
        <Route path="/business/mypage" element={<BusinessMyPage />} />
        <Route path="/credits" element={<CreditsPage />} />
        <Route path="/result/:analysisId" element={<ResultPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forget" element={<ForgetPasswordPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
