import Header from "@/components/Header";

export default function MorePage() {
  return (
    <div>
      <Header />
      <div className="pt-100 gap-4 w-full flex flex-col items-center text-h6 text-primary-dark">
        <p>더 많은 기능 출시를 기다려주세요!</p>
        <p className="text-body1">개발자 문의: TEAM Chatto</p>
      </div>
    </div>
  );
}
