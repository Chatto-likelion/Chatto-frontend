import {
  Header,
  ChatList,
  FileUpload,
  BigServices,
  DetailForm,
} from "@/components";
import { postChat, postAnalyze, getAnalysisDetail } from "@/apis/api";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import * as Icons from "@/assets/svg/index.js";
import SmallServices from "../components/SmallServices";

export default function BusinessContrPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedChatId, setSelectedChatId] = useState(null);
  const chatListReloadRef = useRef();

  const [peopleNum, setPeopleNum] = useState("23명");
  const [relation, setRelation] = useState("동아리 부원");
  const [situation, setSituation] = useState("일상대화");
  const [startPeriod, setStartPeriod] = useState("처음부터");
  const [endPeriod, setEndPeriod] = useState("끝까지");

  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChatSelect = (chatId) => {
    setSelectedChatId((prevId) => (prevId === chatId ? null : chatId));
    console.log("선택된 채팅:", chatId === selectedChatId ? "해제됨" : chatId);
  };

  const handleFileUpload = async (file) => {
    try {
      const result = await postChat(user?.id || 1, file);
      console.log("파일 업로드 성공:", result);

      if (chatListReloadRef.current) {
        chatListReloadRef.current();
      }

      // 업로드한 채팅을 선택
      if (result?.chat_id_play_chem) {
        setSelectedChatId(result.chat_id_play_chem);
      }
    } catch (error) {
      console.error("파일 업로드 실패:", error);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedChatId) {
      alert("먼저 채팅을 선택하세요.");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    const payload = {
      people_num: parseInt(peopleNum),
      rel: relation,
      situation,
      startPeriod,
      endPeriod,
    };

    try {
      const analyzeResponse = await postAnalyze(selectedChatId, payload);
      const resultId = analyzeResponse.result_id_play_chem;

      const detailResponse = await getAnalysisDetail(resultId);
      setAnalysisResult(detailResponse);
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
    <div className="flex flex-col justify-start items-center h-screen bg-white text-gray-8">
      <Header />
      <div className="w-full px-40 pt-28 flex justify-start items-end gap-2 text-primary-dark">
        <p
          className="text-h6 cursor-pointer"
          onClick={() => {
            navigate("/business");
          }}
        >
          Chatto Business
        </p>
        <p className="text-body2">업무 기여도 분석</p>
      </div>
      <div className="flex-1 w-300 overflow-hidden flex justify-between items-start">
        {/* 왼쪽 */}
        <div
          className={`gap-5 pt-22 ${
            analysisResult ? "w-61.5 mr-34.5" : "w-53.5 mr-60.5"
          } flex flex-col items-center justify-center`}
        >
          <ChatList
            onSelect={handleChatSelect}
            selectedChatId={selectedChatId}
            setSelectedChatId={setSelectedChatId}
            onUploaded={chatListReloadRef}
          />

          <FileUpload onUpload={handleFileUpload} />
          {analysisResult && (
            <div className="w-full flex justify-between items-center">
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-16 h-8.5 hover:bg-primary-light hover:text-primary-dark cursor-pointer px-0.25 py-2 text-button text-primary border border-primary rounded-lg"
              >
                결과 공유
              </button>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-16 h-8.5 hover:bg-primary-light hover:text-primary-dark cursor-pointer px-0.25 py-2 text-button text-primary border border-primary rounded-lg"
              >
                결과 저장
              </button>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-16 h-8.5 hover:bg-primary-light hover:text-primary-dark cursor-pointer px-0.25 py-2 text-button text-primary border border-primary rounded-lg"
              >
                퀴즈 생성
              </button>
            </div>
          )}
        </div>

        {/* 가운데 */}
        <main
          className={`flex-1 overflow-y-auto max-h-240 pt-28 ${
            analysisResult ? "w-163.25 pr-18" : "w-157 pr-57"
          } flex flex-col justify-start items-center`}
        >
          {!loading && !analysisResult && (
            <>
              <Icons.ChemiIconFull className="mb-4" />
              <div className="w-full flex flex-col items-center text-body2 text-center mb-21">
                <p>우리의 케미는 얼마나 잘 맞을까?</p>
                <p>
                  주고받은 대화를 토대로 대화 참여자 간의 소통 궁합을
                  확인해보세요.
                  <br />말 속에 숨은 케미 지수를 한눈에 보여드립니다!
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
                  relation={relation}
                  setRelation={setRelation}
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
                분석 시작
              </button>
            </>
          )}

          {/* 결과 출력 */}
          {loading && (
            <p className="mt-44 text-sm text-secondary">분석 중입니다...</p>
          )}
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
          {analysisResult && (
            <div className="w-full flex flex-col items-center gap-6">
              <div className="w-full flex flex-col gap-4 p-6 text-left">
                <div className="flex justify-between">
                  <div className="flex flex-col">
                    <span className="text-st1 text-white">케미 점수</span>
                    <span className="text-h2 text-secondary">82점</span>
                  </div>
                  <div className="flex flex-col text-st2 text-white gap-0.5 mt-1">
                    <p>분석된 메시지 수: 1,342개</p>
                    <p>참여자 수: 23명</p>
                    <p>분석 기간: 최근 6개월</p>
                  </div>
                </div>
                <div className="text-st2 text-white italic mt-2">
                  한 마디: “웃음과 공감이 폭발하는 안정적 팀워크!”
                </div>
              </div>

              <div className="w-full h-200 mb-20 p-4 bg-grayscale-10 border border-secondary rounded-lg text-body2 text-white whitespace-pre-line">
                {analysisResult.content}
              </div>
            </div>
          )}
        </main>

        {/* 오른쪽 */}
        <div
          className={`${
            analysisResult ? "w-47.25" : "w-29"
          } flex flex-col items-center justify-start gap-4`}
        >
          {analysisResult && (
            <div className="w-full mt-40 py-4 px-1 flex flex-col justify-center items-center border-2 border-primary-light rounded-lg  bg-primary-dark">
              <DetailForm
                isAnalysis={true}
                peopleNum={peopleNum}
                setPeopleNum={setPeopleNum}
                relation={relation}
                setRelation={setRelation}
                situation={situation}
                setSituation={setSituation}
                startPeriod={startPeriod}
                setStartPeriod={setStartPeriod}
                endPeriod={endPeriod}
                setEndPeriod={setEndPeriod}
              />
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="mt-6 w-19.75 h-8.5 hover:bg-secondary-light hover:text-primary-dark px-3 py-2 text-button text-secondary-light border border-secondary-light rounded-lg"
              >
                다시 분석
              </button>
            </div>
          )}

          <div
              className={`w-full  ${
                analysisResult ? "h-42" : "mt-22 h-full"
              } border-2 border-primary-light rounded-lg p-3 pb-5 bg-primary-dark`}
            >
              {analysisResult ? <SmallServices /> : <BigServices />}
          </div>
        </div>
      </div>
      <Icons.Chatto className="w-18.75 h-29.75 text-primary-light fixed bottom-5 right-12" />
    </div>
  );
}
