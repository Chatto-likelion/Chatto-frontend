import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import PlayPage from "./pages/PlayPage";
import PlayChemiPage from "./pages/PlayChemiPage";
import PlayChemiAnalysisPage from "./pages/PlayChemiAnalysisPage";
import PlayChemiResultPage from "./pages/PlayChemiResultPage";
import PlaySomePage from "./pages/PlaySomePage";
import PlaySomeAnalysisPage from "./pages/PlaySomeAnalysisPage";
import PlayMbtiPage from "./pages/PlayMbtiPage.jsx";
import PlayMbtiAnalysisPage from "./pages/PlayMbtiAnalysisPage";
import PlayMyPage from "./pages/PlayMyPage";
import BusinessPage from "./pages/BusinessPage";
import BusinessContrPage from "./pages/BusinessContrPage";
import BusinessContrAnalysisPage from "./pages/BusinessContrAnalysisPage";
import BusinessMyPage from "./pages/BusinessMyPage";
import CreditsPage from "./pages/CreditsPage";
import ResultPage from "./pages/ResultPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import ForgetPasswordPage from "./pages/ForgetPasswordPage";
import BusinessResultPage from "./pages/BusinessResultPage_test.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="/play/chemi" element={<PlayChemiPage />} />
        <Route
          path="/play/chemi/:resultId"
          element={<PlayChemiAnalysisPage />}
        />
        <Route
          path="/play/chemi/result-test"
          element={<PlayChemiResultPage />}
        />
        <Route path="/play/some" element={<PlaySomePage />} />
        <Route path="/play/some/:resultId" element={<PlaySomeAnalysisPage />} />
        <Route path="/play/mbti" element={<PlayMbtiPage />} />
        <Route path="/play/mbti/:resultId" element={<PlayMbtiAnalysisPage />} />
        <Route path="/play/mypage" element={<PlayMyPage />} />
        <Route path="/business" element={<BusinessPage />} />
        <Route path="/business/contr" element={<BusinessContrPage />} />
        <Route
          path="/business/contr/:resultId"
          element={<BusinessContrAnalysisPage />}
        />
        <Route
          path="/business/contr/result-test"
          element={<BusinessResultPage />}
        />
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
