import {
  Header,
  ChatList,
  FileUpload,
  DetailForm,
  BigServices,
} from "@/components";
import { postMbtiAnalyze } from "@/apis/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "@/contexts/ChatContext";
import * as Icons from "@/assets/svg/index.js";

export default function PlayMbtiPage() {
  const { selectedChatId } = useChat();
  const navigate = useNavigate();

  const [peopleNum, setPeopleNum] = useState("23명");
  const [relationship, setRelationship] = useState("입력 안 함");
  const [situation, setSituation] = useState("입력 안 함");
  const [startPeriod, setStartPeriod] = useState("처음부터");
  const [endPeriod, setEndPeriod] = useState("끝까지");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const convertPeriodToDate = (label, type) => {
    const now = new Date();
    switch (label) {
      case "처음부터":
        return new Date(now.getFullYear() - 1, 0, 1).toISOString();
      default:
        return type === "end"
          ? now.toISOString()
          : new Date(now.getFullYear() - 1, 0, 1).toISOString();
    }
  };

  const handleAnalyze = async () => {
    if (!selectedChatId) {
      alert("먼저 채팅을 선택하세요.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      analysis_start: convertPeriodToDate(startPeriod, "start"),
      analysis_end: convertPeriodToDate(endPeriod, "end"),
    };

    try {
      const analyzeResponse = await postMbtiAnalyze(selectedChatId, payload);
      const resultId = analyzeResponse.result_id;
      // 결과 페이지로 이동
      navigate(`/play/mbti/${resultId}`);
    } catch (err) {
      setError(err.message || "분석에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-start items-center h-screen bg-primary-dark text-white">
      <Header />
      <div className="flex-1 w-300 mt-17.5 overflow-hidden flex justify-between items-start">
        {/* 왼쪽 */}
        <div className="gap-5 pt-6 w-53.5 mr-60.5 flex flex-col items-center justify-center">
          <div className="w-full mb-32"></div>
          <ChatList />
          <FileUpload />

          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        </div>

        {/* 가운데 */}
        <main className="flex-1 overflow-y-auto max-h-240 scrollbar-hide pt-28 w-157 pr-57 flex flex-col justify-start items-center">
          {!loading && (
            <>
              <p className="text-h6 mb-4">MBTI 분석</p>
              <Icons.ChemiIconFull className="mb-4" />
              <div className="w-full flex flex-col items-center text-body2 text-center mb-21">
                <p>우리의 케미는 얼마나 잘 맞을까?</p>
                <p>
                  주고받은 대화를 토대로 대화 참여자 간의 소통 궁합을
                  확인해보세요.
                  <br /> 말 속에 숨은 케미 지수를 한눈에 보여드립니다!
                </p>
              </div>

              {/* 세부 정보 폼 */}
              <div className="w-96 py-6.5 pl-11 pr-10 flex flex-col items-center border-2 border-primary-light rounded-lg">
                <div className="mb-8 flex flex-col gap-1">
                  <div className="pl-1.5 gap-1 flex justify-center items-end">
                    <span className="bold text-h6 text-white">세부 정보</span>
                    <span className="text-caption text-gray-5">(Optional)</span>
                  </div>
                  <p className="text-caption text-white">
                    더 자세한 분석을 위해 추가 정보를 설정합니다.
                  </p>
                </div>
                <DetailForm
                  isAnalysis={false}
                  peopleNum={peopleNum}
                  setPeopleNum={setPeopleNum}
                  relationship={relationship}
                  setRelationship={setRelationship}
                  situation={situation}
                  setSituation={setSituation}
                  startPeriod={startPeriod}
                  setStartPeriod={setStartPeriod}
                  endPeriod={endPeriod}
                  setEndPeriod={setEndPeriod}
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="mt-6 w-19.75 h-8.5 hover:bg-secondary-light hover:text-primary-dark cursor-pointer px-3 py-2 text-button text-secondary-light border border-secondary-light rounded-lg "
              >
                {loading ? "분석 중..." : "분석 시작"}
              </button>
            </>
          )}
        </main>

        {/* 오른쪽 */}
        <div className="w-29 mt-50 flex flex-col items-center justify-start gap-4">
          <div className="w-full h-full border-2 border-primary-light rounded-lg p-3 pb-5 bg-primary-dark">
            <BigServices />
          </div>
        </div>
      </div>
      <Icons.Chatto className="w-18.75 h-29.75 text-primary-light fixed bottom-5 right-12" />
    </div>
  );
}
