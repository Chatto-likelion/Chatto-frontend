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

export default function PlayChemiPage() {
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
      if (result?.chat_id) {
        setSelectedChatId(result.chat_id);
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
      analysis_start: startPeriod,
      analysis_end: endPeriod,
    };

    try {
      const analyzeResponse = await postAnalyze(selectedChatId, payload);
      const resultId = analyzeResponse.result_id;

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
    <div className="flex flex-col justify-start items-center h-screen bg-primary-dark text-white">
      <Header />
      <div className="flex-1 w-300 mt-17.5 overflow-hidden flex justify-between items-start">
        {/* 왼쪽 */}
        <div
          className={`gap-5 pt-6 ${
            analysisResult ? "w-61.5 mr-34.5" : "w-53.5 mr-60.5"
          } flex flex-col items-center justify-center`}
        >
          <div className="w-full mb-32 flex justify-start items-end gap-2 text-primary-light">
            <p
              className="text-h6 cursor-pointer"
              onClick={() => {
                navigate("/play");
              }}
            >
              Chatto Play
            </p>
            <p className="text-body2">케미측정</p>
          </div>
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
                className="w-16 h-8.5 hover:bg-secondary-light hover:text-primary-dark cursor-pointer px-0.25 py-2 text-button text-secondary-light border border-secondary-light rounded-lg"
              >
                결과 공유
              </button>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-16 h-8.5 hover:bg-secondary-light hover:text-primary-dark cursor-pointer px-0.25 py-2 text-button text-secondary-light border border-secondary-light rounded-lg"
              >
                결과 저장
              </button>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-16 h-8.5 hover:bg-secondary-light hover:text-primary-dark cursor-pointer px-0.25 py-2 text-button text-secondary-light border border-secondary-light rounded-lg"
              >
                퀴즈 생성
              </button>
            </div>
          )}
        </div>

        {/* 가운데 */}
        <main
          className={`flex-1 overflow-y-auto max-h-240 scrollbar-hide pt-28 ${
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

              <div className="w-full h-350 mb-20 p-4 gap-5 flex flex-col justify-start items-start border border-secondary rounded-lg text-body2 text-white whitespace-pre-line">
                {analysisResult.content}
                {/* 대화 톤 */}
                <div>
                  <p className="text-h6 font-bold mb-1">대화 톤</p>
                  <p>긍정적 표현 비중: 63%</p>
                  <p>농담/유머 빈도: 18%</p>
                  <p>비판적 의견: 7%</p>
                </div>

                {/* 예시 대화 */}
                <div>
                  <p className="text-h6 font-bold mb-1">예시 대화</p>
                  <p>A: 야ㅋㅋㅋ 이거 너 또 까먹었지</p>
                  <p>B: 인정ㅋㅋㅋ 이번엔 진짜 메모했다🤣</p>
                  <p>C: 이 방 진짜 텐션 최고네</p>
                  <p className="mt-2">
                    분석: 농담과 자기인정형 유머가 관계 안정에 기여했습니다.
                  </p>
                </div>

                {/* 응답 패턴 */}
                <div>
                  <p className="text-h6 font-bold mb-1">응답 패턴</p>
                  <p>평균 응답 시간: 1시간 5분</p>
                  <p>즉각 응답 비율: 52%</p>
                  <p>‘읽씹’발생률: 8%</p>
                  <p className="mt-2">
                    분석: 대부분 활발히 답변했습니다. 약간의 일씹이 있는 것
                    같기도...?
                  </p>
                </div>

                {/* 대화 주제 비율 */}
                <div>
                  <p className="text-h6 font-bold mb-1">대화 주제 비율</p>
                  <p>업무/과제: 42%</p>
                  <p>잡담/이벤트: 26%</p>
                  <p>격려/감정 표현: 18%</p>
                  <p>미디어 공유: 14%</p>
                </div>

                {/* 감정 온도계 */}
                <div>
                  <p className="text-h6 font-bold mb-1">감정 온도계</p>
                  <p>평균 감정 온도: 따뜻함</p>
                  <p>긍정 언급: ‘좋아요’, ‘고마워요’, ‘ㅋㅋㅋ’</p>
                  <p>부정 언급: ‘힘들자’, ‘귀찮다’</p>
                  <p className="mt-2">
                    분석: 부정적 표현도 자연스러운 공감 대화로 이어져 긴장감이
                    낮습니다.
                  </p>
                </div>

                {/* 관계 친밀도 및 그룹 특성 */}
                <div>
                  <p className="text-h6 font-bold mb-1">
                    관계 친밀도 및 그룹 특성
                  </p>
                  <p className="font-semibold mt-2">친밀도 레벨: 높음</p>
                  <p className="text-body2 mb-2">
                    서로의 근황과 작은 성취까지 챙기는 서포트 그룹형 소통
                  </p>

                  <p className="font-semibold mt-2">네트워크 밀도: 74%</p>
                  <p className="text-body2 mb-2">
                    다수의 멤버가 서로 연결되어 활발히 대화에 참여
                  </p>

                  <p className="font-semibold mt-2">주요 역할 유형</p>
                  <p className="text-body2">
                    리더/조율자: 3명
                    <br />
                    활동가/분위기메이커: 5명
                    <br />
                    관망자: 7명
                    <br />
                    응원러: 8명
                  </p>
                </div>

                {/* AI 추천 */}
                <div>
                  <p className="text-h6 font-bold mb-1 mt-4 border-t border-primary-light pt-2">
                    AI 추천
                  </p>
                  <p className="text-body2">
                    이 방은 서로를 격려하고 빠르게 협력하는 강점이 있습니다.
                    앞으로 대화 주제를 조금 더 다양화하고, ‘관망자’들의 참여를
                    유도하면 관계가 더욱 풍부해질 것입니다.
                  </p>
                </div>

                {/* Tip */}
                <div>
                  <p className="text-h6 font-bold text-yellow-400 mt-4">Tip</p>
                  <p className="text-yellow-400">
                    가벼운 이벤트(사진 공유, 주제 토론)를 시도해보세요
                    <br />
                    ‘읽씹’ 비율이 높은 참여자와 개별 대화도 권장합니다.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* 오른쪽 */}
        <div
          className={`${
            analysisResult ? "w-47.25" : "w-29"
          } mt-50 flex flex-col items-center justify-start gap-4`}
        >
          {analysisResult && (
            <div className="w-full py-4 px-1 flex flex-col justify-center items-center border-2 border-primary-light rounded-lg  bg-primary-dark">
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
              analysisResult ? "h-42" : " h-full"
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
