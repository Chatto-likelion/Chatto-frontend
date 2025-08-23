import {
  Header,
  ChatList,
  FileUpload,
  BigServices,
  DetailForm,
} from "@/components";
import { postContrAnalyze } from "@/apis/api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "@/contexts/ChatContext";
import * as Icons from "@/assets/svg/index.js";

export default function BusinessContrPage() {
  const { selectedChatId } = useChat();
  const navigate = useNavigate();

  const [analysisResult, setAnalysisResult] = useState();
  const [form, setForm] = useState({
    project_type: "",
    team_type: "입력 안 함",
    analysis_start: "처음부터",
    analysis_end: "끝까지",
  });
  const updateForm = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const normalize = (s) => (s && s.trim() ? s.trim() : "입력 안 함");
  const handleAnalyze = async () => {
    if (!selectedChatId) {
      alert("먼저 채팅을 선택하세요.");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const payload = {
        ...form,
        project_type: normalize(form.project_type),
      };

      const analyzeResponse = await postContrAnalyze(selectedChatId, payload);
      const resultId = analyzeResponse.result_id;

      navigate(`/business/contr/${resultId}`);
    } catch (err) {
      console.error(err);
      setError(err.message || "분석에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 선택된 채팅이 바뀌면 결과 초기화
    setAnalysisResult(null);
    setError(null);
  }, [selectedChatId]);

  return (
    <div className="flex flex-col justify-start items-center h-screen bg-white text-primary-dark">
      <Header />
      <div className="relative flex-1 w-308.25 mt-17.5 overflow-hidden flex justify-between items-start">
        {/* 왼쪽 */}
        <div className="gap-5 pt-6 w-53.5 mr-60.5 flex flex-col items-center justify-center">
          <div className="w-full mb-32"></div>
          <ChatList />
          <FileUpload />

          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        </div>

        {/* 가운데 */}
        <main className="flex-1 overflow-y-auto max-h-240 scrollbar-hide pt-28 w-157 pr-57 flex flex-col justify-start items-center">
          <>
            <p className="text-h6 mb-4">업무 참여도 분석</p>
            <Icons.ContrIconFull className="mb-5" />
            <div className="w-full flex flex-col items-center text-gray-8 text-body2 text-center mb-18">
              <p>팀원의 업무 기여도가 얼마나 높을까요?</p>
              <p>
                주고받은 대화 데이터를 기반으로,
                <br />각 참여자의 정보 공유, 업무 조율, 협력 기여도를 객관적으로
                분석합니다.
                <br />팀 내 소통 패턴과 역할 분담의 균형을 한눈에 확인해보세요.
              </p>
            </div>

            {/* 세부 정보 폼 */}
            <div className="w-96 py-6.5 pl-11 pr-10 flex flex-col items-center border-2 border-primary rounded-lg">
              <div className="mb-8 flex flex-col gap-1">
                <div className="pl-1.5 gap-1 flex justify-center items-end">
                  <span className="bold text-h6 text-gray-7">세부 정보</span>
                  <span className="text-caption text-gray-5">(Optional)</span>
                </div>
                <p className="text-caption text-gray-7">
                  더 자세한 분석을 위해 추가 정보를 설정합니다.
                </p>
              </div>
              <DetailForm
                type={1} // 1=contr
                value={form}
                loading={loading}
                onChange={updateForm}
                isAnalysis={false}
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="mt-6 w-19.75 h-8.5 hover:bg-primary hover:text-white cursor-pointer px-3 py-2 text-button text-primary-dark border border-primary rounded-lg "
            >
              {loading ? "분석 중..." : "분석 시작"}
            </button>
          </>
        </main>

        {/* 오른쪽 */}
        <div className="w-38 mt-50 flex flex-col items-center justify-start gap-4">
          <div className="w-full h-full border-2 border-primary rounded-lg p-3 pb-5 bg-white">
            <BigServices />
          </div>
        </div>
      </div>
      <Icons.Chatto className="w-18.75 h-29.75 text-primary-dark fixed bottom-5 right-12" />
    </div>
  );
}
