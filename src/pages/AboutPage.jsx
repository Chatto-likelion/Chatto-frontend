import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import * as Icons from "@/assets/svg/index.js";
import { ChattoBusiness, ChattoPlay } from "../assets/png/LandingIcon";

// TODO: 프로젝트 자산 경로로 교체하세요.
const playShot1 = "/assets/about/play-setup.png";
const playShot2 = "/assets/about/play-result.png";
const bizShot1 = "/assets/about/biz-setup.png";
const bizShot2 = "/assets/about/biz-result.png";

export default function AboutPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("play"); // 'play' | 'business'

  const isPlay = tab === "play";
  const goCTA = () => navigate(isPlay ? "/play" : "/Business");

  return (
    <div className="h-screen flex flex-col bg-white text-primary-dark overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto pt-17 pb-20">
        <section className="mx-auto w-full max-w-[1080px] px-6 pt-15">
          {/* Hero */}
          <div className="flex flex-col items-center text-center">
            <div className="flex items-end gap-6 mb-6 ml-10">
              <h1 className="text-h2 text-primary-dark">Chatto</h1>
              <Icons.Chatto className="w-20 h-32 text-primary-dark" />
            </div>
            <p className="mb- text-h6 text-primary-dark font-bold">
              당신의 어떤 대화라도 분석해드릴게요
            </p>

            <p className="mt-8 text-body1 text-gray-700 leading-7">
              채토는 메신저 대화 데이터를 기반으로,
              <br />
              심리·관계 분석부터 업무 기여도 평가까지 지원하는 통합 대화 분석
              플랫폼입니다.
            </p>
            <p className="mt-4 text-body1 text-gray-700 leading-7">
              우리는 매일 수많은 대화를 나누며 채팅 데이터를 생성하지만,
              <br />그 안에 담긴 문화와 감정, 개인화된 인사이트를 체계적으로
              살펴볼 기회는 흔치 않습니다.
            </p>
            <p className="mt-4 text-body1 text-gray-700 leading-7">
              채토는 우리의 대화를 그냥 흘려보내지 않고,
              <br />
              가치 있는 데이터로 활용하여 다양한 분석을 제공합니다.
            </p>
          </div>

          {/* Tabs */}
          <div className="w-full mt-28 flex justify-center">
            <div className="w-full flex justify-between border-b-2 border-primary-dark overflow-hidden">
              <button
                onClick={() => setTab("play")}
                className={[
                  "px-6 py-2 text-h7 transition-colors rounded-t-lg",
                  isPlay
                    ? "bg-primary-dark text-white"
                    : "bg-white text-primary-dark/40 hover:bg-primary-light/20 border-2 border-b-0 border-primary-light",
                ].join(" ")}
              >
                Chatto Play
              </button>
              <button
                onClick={() => setTab("business")}
                className={[
                  "px-6 py-2 text-h7 transition-colors rounded-t-lg border-2 border-b-0",
                  !isPlay
                    ? "border-primary-dark text-primary-dark"
                    : "bg-white text-primary-dark/40 hover:bg-primary-light/20  border-primary-light",
                ].join(" ")}
              >
                Chatto Business
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {isPlay ? <PlaySection /> : <BusinessSection />}

          <p className="mt-30 text-h6 text-center ">
            자, 이제 직접 사용해보세요!
          </p>

          {/* CTA Card */}
          <div className="mt-8 flex justify-center">
            <div
              className={`w-170 rounded-2xl px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg
              ${
                isPlay
                  ? "bg-primary-dark text-white"
                  : "border-2 border-primary-dark"
              }`}
            >
              <div className="gap-8 flex justify-center items-center">
                <div className="text-left">
                  <h3 className="text-h4">
                    Chatto
                    <span className="text-h4 font-bold">
                      {" "}
                      {isPlay ? "Play" : "Business"}
                    </span>
                  </h3>
                  <p className="mt-2 text-body2">
                    {isPlay
                      ? "케미, 관계, 심리 — 그 밖의 재미있는 분석까지"
                      : "팀 대화에서 기여도, 이슈 흐름, 리스크 조기 탐지까지"}
                  </p>
                </div>
                <img
                  src={isPlay ? ChattoPlay : ChattoBusiness}
                  alt="어바웃페이지 아이콘"
                  className="h-24"
                />
              </div>
              <button
                onClick={goCTA}
                className={`shrink-0 px-3 py-1.5 rounded-md bg-white text-primary-dark text-button hover:bg-primary-light hover:text-primary-dark transition-colors cursor-pointer
                  ${!isPlay && "border-2 border-primary-dark"}`}
              >
                지금 시작하기
              </button>
            </div>
          </div>
        </section>
      </main>
      <Icons.Chatto className="w-18.75 h-29.75 text-primary-dark fixed bottom-5 right-12" />
    </div>
  );
}

/* --------------------------- Sub Components --------------------------- */

function PlaySection() {
  return (
    <div className="flex flex-col items-center">
      {/* 1행: 좌 이미지 / 우 설명 */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <img
          src={playShot1}
          alt="Chatto Play 설정 화면"
          className="w-full rounded-lg shadow-md"
        />
        <div className="flex flex-col justify-center">
          <h4 className="text-h5 font-semibold text-primary-dark">분석 설정</h4>
          <p className="mt-4 text-body1 text-gray-700 leading-7">
            대화방을 업로드하고 관계/상황을 선택하면, 채토가 자동으로 적합한
            지표를 선정하여 분석을 수행합니다. 분석 기간은 최근 대화부터
            과거까지 자유롭게 지정할 수 있어요.
          </p>
        </div>
      </div>

      {/* 2행: 좌 설명 / 우 이미지 */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="order-2 md:order-1 flex flex-col justify-center">
          <h4 className="text-h5 font-semibold text-primary-dark">분석 결과</h4>
          <p className="mt-4 text-body1 text-gray-700 leading-7">
            케미 점수, 응답 패턴, 감정 분포, 유머/긴장 지표 등 재밌고 이해하기
            쉬운 결과를 제공합니다. 팀/모임 대화에도 적용 가능하며 결과는 공유
            링크로 간단히 전달할 수 있어요.
          </p>
        </div>
        <img
          src={playShot2}
          alt="Chatto Play 결과 화면"
          className="order-1 md:order-2 w-full rounded-lg shadow-md"
        />
      </div>
    </div>
  );
}

function BusinessSection() {
  return (
    <div className="flex flex-col items-center">
      {/* 1행: 좌 이미지 / 우 설명 */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <img
          src={bizShot1}
          alt="Chatto Business 설정 화면"
          className="w-full rounded-lg shadow-md"
        />
        <div className="flex flex-col justify-center">
          <h4 className="text-h5 font-semibold text-primary-dark">분석 설정</h4>
          <p className="mt-4 text-body1 text-gray-700 leading-7">
            업무 채팅을 선택하고 프로젝트/팀 정보를 연결하면, 메시지 흐름과 이슈
            맥락을 고려한 분석이 준비됩니다. 개인정보와 민감정보는 사전에
            비식별화합니다.
          </p>
        </div>
      </div>

      {/* 2행: 좌 설명 / 우 이미지 */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="order-2 md:order-1 flex flex-col justify-center">
          <h4 className="text-h5 font-semibold text-primary-dark">분석 결과</h4>
          <p className="mt-4 text-body1 text-gray-700 leading-7">
            기여도/담당 영역, 병목 지점, 위험 이슈의 조기 신호를 시각화합니다.
            반복 회의 요약과 액션 아이템 추적까지 지원하여 팀 생산성 향상에 바로
            연결되도록 설계했습니다.
          </p>
        </div>
        <img
          src={bizShot2}
          alt="Chatto Business 결과 화면"
          className="order-1 md:order-2 w-full rounded-lg shadow-md"
        />
      </div>
    </div>
  );
}
