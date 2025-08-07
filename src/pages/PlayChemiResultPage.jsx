import {
  Header,
  ChatList,
  FileUpload,
  DetailForm,
  SmallServices,
} from "@/components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import * as Icons from "@/assets/svg/index.js";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import InteractionMatrix from "@/components/InteractionMatrix";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ChemiResultPage() {
  const auth = useAuth();
  const user = auth?.user || { id: 1 }; // 기본값 세팅
  const navigate = useNavigate();

  const [peopleNum, setPeopleNum] = useState("23명");
  const [relation, setRelation] = useState("동아리 부원");
  const [situation, setSituation] = useState("일상대화");
  const [startPeriod, setStartPeriod] = useState("처음부터");
  const [endPeriod, setEndPeriod] = useState("끝까지");

  // 더미 데이터
  const score = 82;
  const messageCount = 1342;
  const peopleCount = 23;
  const period = "처음부터 마지막까지";

  const toneData = [63, 18, 7];
  const topicData = [42, 26, 18, 14];

  return (
    <div className="flex flex-col justify-start items-center h-screen bg-primary-dark text-white">
      <Header />
      <div className="flex-1 w-300 mt-17.5 overflow-hidden flex justify-between items-start">
        {/* 왼쪽 */}
        <div className="gap-5 pt-6 w-61.5 mr-34.5 flex flex-col items-center justify-center">
          {/* <ChatList /> */}
          <FileUpload />
        </div>

        {/* 가운데 */}
        <main className="flex-1 overflow-y-auto max-h-240 scrollbar-hide pt-10 w-163.25 pr-18 flex flex-col justify-start items-center gap-8">
          {/* 종합 케미 점수 */}
          <section className="w-full p-6 border border-secondary rounded-lg">
            <h2 className="text-h3 text-secondary mb-2">{score}점</h2>
            <p>분석된 메시지 수: {messageCount}개</p>
            <p>참여자 수: {peopleCount}명</p>
            <p>분석 기간: {period}</p>
            <p className="mt-4">
              정서 동기화 + 주제 밀도 높음! 이 방은 완벽한 케미 방이었어요.
            </p>
          </section>

          {/* 상호작용 매트릭스 */}
          <section className="w-full p-6 border border-secondary rounded-lg">
            <h3 className="text-h6 font-bold mb-2">상호작용 매트릭스</h3>
            <p className="text-body2 mb-4">
              ※ 진한 선일수록 대화가 활발합니다! 분석 대상은 대화량 상위
              5명입니다.
            </p>
            <InteractionMatrix />
          </section>

          {/* 케미 순위 TOP3 */}
          <section className="w-full p-6 border border-secondary rounded-lg">
            <h3 className="text-h6 font-bold mb-4">케미 순위 TOP3</h3>
            <p>TOP1 수빈 & 민지 – 96점</p>
            <p>TOP2 준서 & 은지 – 91점</p>
            <p>TOP3 민지 & 지윤 – 88점</p>
          </section>

          {/* 대화 톤 */}
          <section className="w-full p-6 border border-secondary rounded-lg">
            <h3 className="text-h6 font-bold mb-4">대화 톤</h3>
            <div className="flex items-center gap-6">
              <div className="w-32 h-32">
                <Pie
                  data={{
                    labels: ["긍정적 표현", "농담/유머", "비판적 의견"],
                    datasets: [
                      {
                        data: toneData,
                        backgroundColor: ["#FFFFFF", "#FFD966", "#BFBFBF"],
                        borderWidth: 0,
                      },
                    ],
                  }}
                  options={{
                    plugins: { legend: { display: false } },
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </div>
              <div>
                <p>긍정적 표현: 63%</p>
                <p>농담/유머: 18%</p>
                <p>비판적 의견: 7%</p>
              </div>
            </div>
          </section>

          {/* 응답 패턴 */}
          <section className="w-full p-6 border border-secondary rounded-lg">
            <h3 className="text-h6 font-bold mb-2">응답 패턴</h3>
            <p>평균 응답 시간: 1시간 5분</p>
            <p>즉각 응답 비율: 52%</p>
            <p>읽씹 발생률: 8%</p>
          </section>

          {/* 대화 주제 비율 */}
          <section className="w-full p-6 border border-secondary rounded-lg">
            <h3 className="text-h6 font-bold mb-4">대화 주제 비율</h3>
            <div className="w-32 h-32">
              <Pie
                data={{
                  labels: [
                    "업무/과제",
                    "잡담/이벤트",
                    "격려/감정 표현",
                    "미디어 공유",
                  ],
                  datasets: [
                    {
                      data: topicData,
                      backgroundColor: [
                        "#FFFFFF",
                        "#FFD966",
                        "#BFBFBF",
                        "#8EC6FF",
                      ],
                      borderWidth: 0,
                    },
                  ],
                }}
                options={{
                  plugins: { legend: { display: false } },
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </section>

          {/* 서비스 분석 */}
          <section className="w-full p-6 border border-secondary rounded-lg">
            <h3 className="text-h6 font-bold mb-2">챗토의 서비스 분석</h3>
            <p>“준서 님은 반응이 느립니다. 나타날 땐 임팩트 있음!”</p>
            <p>“수빈과 민지는 대화의 실질적 캐필러입니다.”</p>
          </section>

          {/* 레벨 업 가이드 */}
          <section className="w-full p-6 border border-secondary rounded-lg">
            <h3 className="text-h6 font-bold mb-2">
              챗토의 케미 레벨 업 가이드
            </h3>
            <ul className="list-disc pl-6">
              <li>대화 주제 리프레시</li>
              <li>요즘 핫한 주제 도입</li>
              <li>사진과 웃긴 짤 공유</li>
            </ul>
          </section>
        </main>

        {/* 오른쪽 */}
        <div className="w-47.25 mt-50 flex flex-col items-center justify-start gap-4">
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
          <div className="w-full h-42 border-2 border-primary-light rounded-lg p-3 pb-5 bg-primary-dark">
            <SmallServices />
          </div>
        </div>
      </div>
      <Icons.Chatto className="w-18.75 h-29.75 text-primary-light fixed bottom-5 right-12" />
    </div>
  );
}
