import PageCard from "../components/PageCard";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="flex flex-col items-center justify-center space-y-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-h3 text-primary font-bold">Chatto</h1>
          <p className="text-st1 text-primary-dark mt-2">
            당신의 어떤 대화라도 분석해드릴게요
          </p>
        </div>
        <div className="flex space-x-8">
          <PageCard
            title="Chatto"
            boldTitlePart="Play"
            description="케미, 관계, 심리 그 밖의 재미로 분석까지"
            buttonText="지금 시작하기"
            bgColor="bg-primary-dark"
            textColor="text-white"
            navigateTo="/play"
          />
          <PageCard
            title="Chatto"
            boldTitlePart="Business"
            description="상여도, 업무 가이드 등 다양한 분석 자료 제공"
            buttonText="지금 시작하기"
            border="border border-primary-dark"
            textColor="text-primary-dark"
            navigateTo="/business"
          />
        </div>
      </main>
    </div>
  );
}
