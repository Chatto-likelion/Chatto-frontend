import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import * as Icons from "@/assets/svg/index.js";
import { ChattoBusiness, ChattoPlay } from "../assets/png/LandingIcon";

// TODO: 프로젝트 자산 경로로 교체하세요.
const kakaoExtract = "/assets/png/kakaoExtract.png";
const fileUpload = "/assets/png/fileUpload.png";
const playOption = "/assets/png/playOption.png";
const playAnalysis = "/assets/png/playAnalysis.png";
const playQuiz = "/assets/png/playQuiz.png";
const businessOption = "/assets/png/businessOption.png";
const businessAnalysis = "/assets/png/businessAnalysis.png";

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
              챗토는 메신저 대화 데이터를 기반으로,
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
              챗토는 우리의 대화를 그냥 흘려보내지 않고,
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
                    ? "bg-primary-dark text-white"
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
            자, 이제 직접 이용해보세요!
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
    <div className="flex flex-col items-center gap-12">
      {/* 1행: 좌 이미지 / 우 설명 */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="gap-4 flex items-center">
          <img
            src={kakaoExtract}
            alt="카카오톡 대화 추출 이미지"
            className="w-full rounded-lg shadow-md"
          />
          <img
            src={fileUpload}
            alt="파일 업로드 이미지"
            className="w-full rounded-lg shadow-md"
          />
        </div>

        <div className="flex flex-col justify-center">
          <h4 className="text-h5 font-semibold text-primary-dark">
            카카오톡 대화 업로드하기
          </h4>
          <p className="mt-4 text-body1 text-gray-700 leading-5">
            데스크탑 카카오톡 앱에서 분석하고 싶은 채팅방을 연 후, 우측 상단
            옵션에서 "대화 내용" -{">"} "대화 내보내기" 를 눌러 txt 파일을
            저장해주세요.
          </p>
          <p className="mt-4 text-body1 text-gray-700 leading-5">
            {
              "(현재 윈도우 데스크톱 앱에서 추출한 파일만 분석 및 업로드가 가능합니다.)"
            }
          </p>
          <p className="mt-4 text-body1 text-gray-700 leading-5">
            추출한 대화 txt 파일을 마우스로 드래그 해 폴더 아이콘에 놓으면, 위쪽
            '업로드된 채팅' 메뉴에 파일이 나타날 거에요. 직접 파일을 선택하고
            싶다면, 파일 찾아보기를 눌러 찾으실 수도 있습니다.
          </p>
          <p className="mt-4 text-body1 text-gray-700 leading-5">
            업로드 후 채팅방 이름을 수정하거나, 채팅을 삭제하실 수도 있어요.
          </p>
        </div>
      </div>

      {/* 2행: 좌 설명 / 우 이미지 */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1 flex flex-col justify-center">
          <h4 className="text-h5 font-semibold text-primary-dark">
            분석 옵션 설정하기
          </h4>
          <p className="mt-4 text-body1 text-gray-700 leading-5">
            '업로드된 채팅'에서 분석할 채팅을 선택한 뒤, 화면 중앙에서 분석에
            사용될 세부 정보를 입력하실 수 있어요.
          </p>
          <p className="mt-4 text-body1 text-gray-700 leading-5">
            물론 입력하지 않으셔도 되지만, 입력해 주시면 AI가 세부 옵션을 보고
            더 정확한 분석을 제공할 수 있습니다!
          </p>
        </div>
        <img
          src={playOption}
          alt="Chatto Play 결과 화면"
          className="order-1 md:order-2 w-full rounded-lg shadow-md"
        />
      </div>

      {/* 3행: 좌 이미지 / 우 설명 */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <img
          src={playAnalysis}
          alt="Chatto Play 설정 화면"
          className="w-full rounded-lg shadow-md"
        />
        <div className="flex flex-col justify-center">
          <h4 className="text-h5 font-semibold text-primary-dark">분석 결과</h4>
          <p className="mt-4 text-body1 text-gray-700 leading-5">
            잠시만 기다려주시면, 챗토 AI 모델이 채팅 파일을 보고 다양한 분석을
            제공해 줄 거에요! 가려진 일부 분석 결과는, 크레딧을 소모해서
            확인하실 수 있어요!
          </p>
          <p className="mt-4 text-body1 text-gray-700 leading-5">
            '결과 공유' 버튼을 누르면 다른 친구들에게 분석 결과를 공유할 수도
            있어요.
          </p>
          <p className="mt-4 text-body1 text-gray-700 leading-5">
            '퀴즈 생성' 버튼을 누르면 챗토 AI가 분석 결과를 바탕으로 재밌는
            퀴즈를 만들어 줄 거에요.
          </p>
        </div>
      </div>

      {/* 4행: 좌 설명 / 우 이미지 */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1 flex flex-col justify-center">
          <h4 className="text-h5 font-semibold text-primary-dark">
            퀴즈 생성/공유
          </h4>
          <p className="mt-4 text-body1 text-gray-700 leading-5">
            챗토 AI가 분석 결과를 바탕으로 10개의 퀴즈를 제공해줍니다!
          </p>
          <p className="mt-4 text-body1 text-gray-700 leading-5">
            퀴즈의 내용은 수정하거나, 삭제하실 수도 있어요. 또한 크레딧을 소모해
            새로운 퀴즈를 생성할 수도 있답니다.
          </p>
          <p className="mt-4 text-body1 text-gray-700 leading-5">
            '퀴즈 공유' 버튼을 눌러 퀴즈 링크를 공유해, 친구들과 퀴즈를 풀어보고
            결과를 비교해보세요!
          </p>
        </div>
        <img
          src={playQuiz}
          alt="Chatto Play 결과 화면"
          className="order-1 md:order-2 w-full rounded-lg shadow-md"
        />
      </div>
    </div>
  );
}

function BusinessSection() {
  return (
    <div className="flex flex-col items-center gap-12">
      {/* 1행: 좌 이미지 / 우 설명 */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="gap-4 flex items-center">
          <img
            src={kakaoExtract}
            alt="카카오톡 대화 추출 이미지"
            className="w-full rounded-lg shadow-md"
          />
          <img
            src={fileUpload}
            alt="파일 업로드 이미지"
            className="w-full rounded-lg shadow-md"
          />
        </div>

        <div className="flex flex-col justify-center">
          <h4 className="text-h5 font-semibold text-primary-dark">
            카카오톡 대화 업로드하기
          </h4>
          <p className="mt-4 text-body1 text-gray-700 leading-5">
            데스크탑 카카오톡 앱에서 분석하고 싶은 채팅방을 연 후, 우측 상단
            옵션에서 "대화 내용" -{">"} "대화 내보내기" 를 눌러 txt 파일을
            저장해주세요.
          </p>
          <p className="mt-4 text-body1 text-gray-700 leading-5">
            {
              "(현재 윈도우 데스크톱 앱에서 추출한 파일만 분석 및 업로드가 가능합니다.)"
            }
          </p>
          <p className="mt-4 text-body1 text-gray-700 leading-5">
            추출한 대화 txt 파일을 마우스로 드래그 해 폴더 아이콘에 놓으면, 위쪽
            '업로드된 채팅' 메뉴에 파일이 나타날 거에요. 직접 파일을 선택하고
            싶다면, 파일 찾아보기를 눌러 찾으실 수도 있습니다.
          </p>
          <p className="mt-4 text-body1 text-gray-700 leading-5">
            업로드 후 채팅방 이름을 수정하거나, 채팅을 삭제하실 수도 있어요.
          </p>
        </div>
      </div>

      {/* 2행: 좌 설명 / 우 이미지 */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1 flex flex-col justify-center">
          <h4 className="text-h5 font-semibold text-primary-dark">
            분석 옵션 설정하기
          </h4>
          <p className="mt-4 text-body1 text-gray-700 leading-5">
            '업로드된 채팅'에서 분석할 채팅을 선택한 뒤, 화면 중앙에서 분석에
            사용될 세부 정보를 입력하실 수 있어요.
          </p>
          <p className="mt-4 text-body1 text-gray-700 leading-5">
            물론 입력하지 않으셔도 되지만, 입력해 주시면 AI가 세부 옵션을 보고
            더 정확한 분석을 제공할 수 있습니다!
          </p>
        </div>
        <img
          src={playOption}
          alt="Chatto Play 결과 화면"
          className="order-1 md:order-2 w-full rounded-lg shadow-md"
        />
      </div>

      {/* 3행: 좌 이미지 / 우 설명 */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <img
          src={businessAnalysis}
          alt="Chatto Play 설정 화면"
          className="w-full rounded-lg shadow-md"
        />
        <div className="flex flex-col justify-center">
          <h4 className="text-h5 font-semibold text-primary-dark">분석 결과</h4>
          <p className="mt-4 text-body1 text-gray-700 leading-5">
            잠시만 기다려주시면, 챗토 AI 모델이 채팅 파일을 보고 다양한 분석을
            제공해 줄 거에요! 가려진 일부 분석 결과는, 크레딧을 소모해서
            확인하실 수 있어요!
          </p>
          <p className="mt-4 text-body1 text-gray-700 leading-5">
            '결과 공유' 버튼을 누르면 다른 친구들에게 분석 결과를 공유할 수도
            있어요.
          </p>
        </div>
      </div>
    </div>
  );
}
