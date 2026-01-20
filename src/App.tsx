import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import QRCode from "react-qr-code";
import { fromCode, timestampToDate } from "./utils";
import md5 from "./utils/md5";

type ResultStatus = "finish" | "fail" | "fake" | "loading";

interface ResultImage {
  gmtCreate: number;
  gmtModified: number;
  id: string;
  image: string;
  modelId: string;
  modelName: string;
  orderId: string;
  rangeId: string;
}

interface IdentifyData {
  id: string;
  status: ResultStatus;
  appraiserName: string;
  imageList: ResultImage[];
  gmtCreate: number;
}

const App: React.FC = () => {
  const [data, setData] = useState<IdentifyData | null>(null);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!contentRef.current) return;

    try {
      const canvas = await html2canvas(contentRef.current, {
        useCORS: true,
        scale: window.devicePixelRatio * 2,
        backgroundColor: "#f7f7f7",
        scrollY: 0,
      });

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `authentication-report-${data?.id || "scan"}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch (error) {
      console.error("Screenshot failed:", error);
    }
  };

  const hideCharacters = (name: string) => {
    if (!name) return name;
    const length = name.length;
    if (length === 1) {
      return name;
    } else if (length === 2) {
      return name.charAt(0) + "*";
    } else {
      return name.charAt(0) + "*".repeat(length - 2) + name.charAt(length - 1);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get("id") || "63424231";

      try {
        const appid = fromCode("01C01F01F01C01H01J01D01K");
        const appSecret = fromCode("02P01G01G01L01I01I01J02T02Q01H02Q02P01G01G01H01C02P02P01G02R01L01J02Q02P01F02T02S02Q02P01H01K02S");
        const timestamp = Date.now();

        const sign = md5.md5(`appid=${appid}&orderId=${id}&timestamp=${timestamp}&appSecret=${appSecret}`).toUpperCase();

        const response = await fetch(
          `https://api.puresnake.com/v3/appraise/order?orderId=${id}&appid=${appid}&timestamp=${timestamp}&sign=${sign}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              // 'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`,
            },
          },
        );

        const result = await response.json();

        console.log(result);

        if (result.success) {
          setData(result.data);
        } else {
          console.log(result.msg);
        }
      } catch (error) {
        console.error("Failed to fetch identification data:", error);

        setData({
          status: "fail",
          appraiserName: "Unknown",
          id: id,
          imageList: [],
          gmtCreate: Date.now(),
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#f7f7f7] z-[2000] flex flex-col items-center justify-center">
        <div className="w-11 h-11 border-4 border-[#e1e4e8] border-t-[#29cc85] rounded-full animate-spin mb-4"></div>
        <p className="text-[#9da3ae] text-sm text-center">Проверка подлинности...</p>
      </div>
    );
  }

  if (!data) return null;
  const isPass = data.status === "finish";

  return (
    <div ref={contentRef} className="max-w-[7.5rem] mx-auto min-h-screen flex flex-col bg-[#f7f7f7] relative pb-[2rem]">
      {/* Header */}
      {/* <header className="px-[0.32rem] h-[0.88rem] flex items-center sticky top-0 bg-[#f7f7f7] z-[100]">
        <button
          className="w-[0.64rem] h-[0.64rem] rounded-full flex items-center justify-center -ml-[0.1rem] hover:opacity-70 transition-opacity"
          onClick={() => window.history.back()}>
          <svg
            className="w-[0.40rem] h-[0.40rem] text-[#1a1a1b]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      </header> */}

      <main className="flex-1">
        {/* Result Ticket Card */}
        <div className="relative w-full aspect-[750/868] bg-[url('/assets/background.png')] bg-contain bg-center bg-no-repeat flex flex-col pt-[1.20rem] pb-[0.4rem] px-[0.57rem]">
          {/* Title */}
          <div className="mb-[0.67rem] text-center">
            <h1 className="font-inter text-[0.40rem] font-black italic text-[#26273a] uppercase tracking-wide leading-none">
              Результат проверки
            </h1>
          </div>

          {/* Status & Info */}
          <div className="flex-1 flex flex-col relative w-full">
            {/* Status Box */}
            <div
              className={`flex items-center mx-[0.08rem] py-[0.3rem] px-[0.1rem] rounded-[0.1rem] gap-[0.04rem] ${isPass ? "bg-[#EAFDF5] text-[#00B050]" : "bg-[#FFF5F5] text-[#FF4D4F]"}`}>
              <div className="w-[0.76rem] h-[0.76rem] flex items-center justify-center">
                <div
                  className={`w-[0.64rem] h-[0.64rem] flex items-center justify-center rounded-full shrink-0 ${isPass ? "bg-[#00B050]" : "bg-[#FF4D4F]"} text-white`}>
                  {isPass ? (
                    <svg
                      className="w-[0.40rem] h-[0.40rem]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg
                      className="w-[0.40rem] h-[0.40rem]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="text-[0.36rem] font-bold flex-1 font-sf-pro">
                {isPass ? "Изделие соответствует признакам оригинала" : "Признаков подлинности не выявлено"}
              </div>

              {/* Stamp */}
              <div className="absolute top-[1.0rem] right-[0.2rem] opacity-40 pointer-events-none z-10">
                <img
                  src={isPass ? "/assets/pass.png" : "/assets/failed.png"}
                  className="w-[1.92rem] h-auto object-contain opacity-90"
                  alt={isPass ? "Passed" : "Failed"}
                />
              </div>
            </div>

            {/* Statement Text */}
            <div className="text-center px-[0.2rem] mb-[0.76rem] mt-[0.57rem] ">
              <p className="text-[#9ea3ae] text-[0.28rem] leading-[0.38rem] scale-90 origin-center">
                Заключение вынесено на
                <br />
                основепредоставленных пользователем
                <br />
                фотографий
              </p>
            </div>

            {/* Details */}
            <div className="flex-1 flex flex-col justify-center space-y-[0.24rem] pt-[0.2rem]">
              <div className="flex justify-between items-baseline text-[0.28rem]">
                <span className="text-[#26273A] text-[0.24rem]">Эксперт по проверке подлинности</span>
                <span className="text-[#0F1113] font-bold">{hideCharacters(data.appraiserName)}</span>
              </div>
              <div className="flex justify-between items-baseline text-[0.28rem]">
                <span className="text-[#26273A] text-[0.24rem]">Номер проверки</span>
                <span className="text-[#0F1113] font-bold font-outfit">{data.id}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white pt-[0.28rem] pb-[0.31rem]">
          {/* Date */}
          <div className="text-center mb-[0.36rem]">
            <div className="text-[#9ea3ae] text-[0.24rem] mb-[0.16rem] font-sf-pro">Дата публикации</div>
            <div className="text-[#1a1a1x] text-[0.28rem] font-bold font-inter">{timestampToDate(data.gmtCreate)}</div>
          </div>

          {/* Photos */}
          <div className="grid grid-cols-2 gap-[0.2rem] mx-[0.25rem]">
            {data.imageList.map((item) => (
              <div
                key={item.id}
                className="w-[3.45rem] h-[3.45rem] aspect-square bg-[#F2F2F2] rounded-[0.04rem] flex items-center justify-center text-[#d1d5db]">
                <img src={item.image} alt="" />
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-[#fafafa] py-[0.3rem] px-[0.24rem]">
          <h4 className="text-[0.22rem] font-bold text-[#888891] text-center mb-[0.34rem] font-sf-pro uppercase">
            Об отказе от ответственности
          </h4>
          <p className="text-[0.22rem] text-[#ACACB7] leading-[1.5]">
            Данное заключение основано исключительно на фотографиях товара, предоставленных пользователем, и на текущих стандартах проверки.
            Из-за угла съёмки, освещения и других факторов возможны расхождения с фактическим состоянием изделия; вывод носит справочный
            характер — ориентируйтесь на реальный предмет. Эксперт также не несёт ответственности за подлинность происхождения товара и
            возможные следы его восстановления. Рекомендуем пользователю учитывать дополнительную информацию при окончательной оценке.
          </p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center">
          <div className="bg-white p-[0.10rem] rounded-[0.1rem] shadow-sm">
            <QRCode value={`http://192.168.0.151:5173/?id=${data.id}`} size={100} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        data-html2canvas-ignore
        className="fixed bottom-0 left-0 right-0 p-[0.32rem] bg-gradient-to-t from-white via-white to-transparent">
        <button
          onClick={handleDownload}
          className="w-full h-[0.88rem] bg-white border border-[#06D290] text-[#06D290] rounded-4rem text-[0.34rem] font-bold shadow-[0_4px_12px_rgba(41,204,133,0.15)] active:scale-[0.98] transition-transform">
          Скачать отчет об аутентификации
        </button>
      </footer>
    </div>
  );
};

export default App;
