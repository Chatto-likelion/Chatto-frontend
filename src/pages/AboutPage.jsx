import PageCard from "../components/PageCard";
import Header from "../components/Header";
import * as Icons from "@/assets/svg/index.js";
import { ChattoBusiness, ChattoPlay } from "../assets/png/LandingIcon";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="flex items-center justify-center gap-16 py-40">
        <div className="flex flex-col items-center w-165">
          <div className="flex items-end gap-8 mb-6">
            <h1 className="text-h1 text-primary-dark">Chatto</h1>
            <Icons.Chatto className="w-25 h-40 text-primary-dark" />
          </div>
          <p className="text-h5 text-primary-dark font-bold">About Page</p>
        </div>
        <div className="flex flex-col gap-14 pr-14">
          <PageCard
            title="Chatto"
            boldTitlePart="Play"
            description={
              <>
                케미, 관계, 심리
                <br />그 밖의 재밌는 분석까지
              </>
            }
            buttonText="지금 시작하기"
            bgColor="bg-primary-dark"
            textColor="text-white"
            icon={ChattoPlay}
            navigateTo="/play"
          />
          <PageCard
            title="Chatto"
            boldTitlePart="Business"
            description={
              <>
                참여도, 업무 기여도 등<br />
                다양한 분석 지표 제공
              </>
            }
            buttonText="지금 시작하기"
            border="border border-2 border-primary-dark"
            textColor="text-primary-dark"
            icon={ChattoBusiness}
            buttonBorder="border border-2 border-primary-dark"
            navigateTo="/business"
          />
        </div>
      </main>
    </div>
  );
}
