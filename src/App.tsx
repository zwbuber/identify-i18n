import React, { useState, useEffect, useRef } from 'react'
import html2canvas from 'html2canvas'

type ResultStatus = 'pass' | 'failed' | 'loading'

interface IdentifyData {
    status: ResultStatus;
    expert: string;
    number: string;
    publishDate: string;
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
                backgroundColor: '#f7f7f7',
                scrollY: 0,
            });

            const image = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = image;
            link.download = `authentication-report-${data?.number || 'scan'}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Screenshot failed:", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const urlParams = new URLSearchParams(window.location.search);
            const id = urlParams.get('id') || '44310928';

            try {
                const response = await fetch('https://api.puresnake.com/v3/appraise/order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // 'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`,
                    },
                    body: JSON.stringify({
                        orderId: id,
                    }),
                });

                const { status, expert, number, publishDate } = await response.json();

                setData({
                    status: status,
                    expert: expert,
                    number: `CN${id}`,
                    publishDate: publishDate || '2025-11-03 11:43:06',
                });
            } catch (error) {
                console.error("Failed to fetch identification data:", error);

                setData({
                    status: 'failed',
                    expert: 'Unknown',
                    number: `CN${id}`,
                    publishDate: '2025-11-03 11:43:06',
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
    const isPass = data.status === 'pass';

    return (
        <div ref={contentRef} className="max-w-[7.5rem] mx-auto min-h-screen flex flex-col bg-[#f7f7f7] relative pb-[2rem]">
            {/* Header */}
            <header className="px-[0.32rem] h-[0.88rem] flex items-center sticky top-0 bg-[#f7f7f7] z-[100]">
                <button
                    className="w-[0.64rem] h-[0.64rem] rounded-full flex items-center justify-center -ml-[0.1rem] hover:opacity-70 transition-opacity"
                    onClick={() => window.history.back()}
                >
                    <svg className="w-[0.40rem] h-[0.40rem] text-[#1a1a1b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
            </header>

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
                        <div className={`flex items-center mx-[0.08rem] p-[0.24rem] rounded-[0.16rem] gap-[0.2rem] ${isPass ? 'bg-[#EAFDF5] text-[#00B050]' : 'bg-[#FFF5F5] text-[#FF4D4F]'}`}>
                            <div className={`w-[0.64rem] h-[0.64rem] flex items-center justify-center rounded-full shrink-0 ${isPass ? 'bg-[#00B050]' : 'bg-[#FF4D4F]'} text-white`}>
                                {isPass ? (
                                    <svg className="w-[0.40rem] h-[0.40rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : (
                                    <svg className="w-[0.40rem] h-[0.40rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                )}
                            </div>
                            <div className="text-[0.36rem] font-bold leading-tight flex-1">
                                {isPass ? "Изделие соответствует признакам оригинала" : "Признаков подлинности не выявлено"}
                            </div>

                            {/* Stamp */}
                            <div className="absolute top-[0.6rem] right-[0.2rem] pointer-events-none z-10">
                                <img
                                    src={isPass ? "/assets/pass.png" : "/assets/failed.png"}
                                    className="w-[1.8rem] h-auto object-contain opacity-90"
                                    alt={isPass ? "Passed" : "Failed"}
                                />
                            </div>
                        </div>

                        {/* Statement Text */}
                        <div className="text-center px-[0.2rem] mb-[0.75rem] mt-[0.57rem] ">
                            <p className="text-[#9ea3ae] text-[0.28rem] leading-relaxed scale-90 origin-center">
                                Заключение вынесено на<br />
                                основепредоставленных пользователем<br />
                                фотографий
                            </p>
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-center space-y-[0.24rem] pt-[0.2rem]">
                            <div className="flex justify-between items-baseline text-[0.28rem]">
                                <span className="text-[#26273A] text-[0.24rem]">Эксперт по проверке подлинности</span>
                                <span className="text-[#0F1113] font-bold">{data.expert}</span>
                            </div>
                            <div className="flex justify-between items-baseline text-[0.28rem]">
                                <span className="text-[#26273A] text-[0.24rem]">Номер проверки</span>
                                <span className="text-[#0F1113] font-bold font-outfit">{data.number}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white pt-[0.28rem] pb-[0.31rem]">

                    {/* Date */}
                    <div className="text-center mb-[0.36rem]">
                        <div className="text-[#9ea3ae] text-[0.24rem] mb-[0.16rem] font-sf-pro">Дата публикации</div>
                        <div className="text-[#1a1a1x] text-[0.36rem] font-bold font-inter">{data.publishDate}</div>
                    </div>

                    {/* Photos */}
                    <div className="grid grid-cols-2 gap-[0.2rem] mx-[0.25rem]">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-[3.45rem] h-[3.45rem] aspect-square bg-[#F2F2F2] rounded-[0.04rem] flex items-center justify-center text-[#d1d5db]">
                                <span className="text-[0.24rem]">Image {i}</span>
                            </div>
                        ))}
                    </div>

                </div>

                {/* Disclaimer */}
                <div className="bg-[#fafafa] py-[0.3rem] px-[0.24rem]">
                    <h4 className="text-[0.22rem] font-bold text-[#888891] text-center mb-[0.34rem] font-sf-pro uppercase">Об отказе от ответственности</h4>
                    <p className="text-[0.22rem] text-[#ACACB7] leading-[1.5]">
                        Данное заключение основано исключительно на фотографиях товара, предоставленных пользователем, и на текущих стандартах проверки. Из-за угла съёмки, освещения и других факторов возможны расхождения с фактическим состоянием изделия; вывод носит справочный характер — ориентируйтесь на реальный предмет.
                        Эксперт также не несёт ответственности за подлинность происхождения товара и возможные следы его восстановления. Рекомендуем пользователю учитывать дополнительную информацию при окончательной оценке.
                    </p>
                </div>

                {/* QR Code */}
                <div className="flex justify-center">
                    <div className="bg-white w-[2.50rem] h-[2.5rem] p-[0.1rem] rounded-[0.1rem] shadow-sm">
                        <svg className="w-[2.30rem] h-[2.30rem]" viewBox="0 0 100 100">
                            <rect width="100" height="100" fill="white" />
                            <path d="M10,10 h30 v30 h-30 z M15,15 h20 v20 h-20 z M22,22 h6 v6 h-6 z" fill="#333" />
                            <path d="M60,10 h30 v30 h-30 z M65,15 h20 v20 h-20 z M72,22 h6 v6 h-6 z" fill="#333" />
                            <path d="M10,60 h30 v30 h-30 z M15,65 h20 v20 h-20 z M22,72 h6 v6 h-6 z" fill="#333" />
                            <path d="M60,60 h10 v10 h-10 z M80,60 h10 v10 h-10 z M60,80 h10 v10 h-10 z M75,70 h15 v5 h-15 z M70,85 h20 v5 h-20 z" fill="#333" />
                        </svg>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer data-html2canvas-ignore className="fixed bottom-0 left-0 right-0 p-[0.32rem] bg-gradient-to-t from-white via-white to-transparent">
                <button
                    onClick={handleDownload}
                    className="w-full h-[1.08rem] bg-white border border-[#29cc85] text-[#29cc85] rounded-full text-[0.34rem] font-bold shadow-[0_4px_12px_rgba(41,204,133,0.15)] active:scale-[0.98] transition-transform"
                >
                    Скачать отчет об аутентификации
                </button>
            </footer>
        </div>
    );
}

export default App;
