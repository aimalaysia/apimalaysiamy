export default function Loader() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0e27]">
      <div className="flag-container relative w-48 h-32 overflow-hidden rounded-lg shadow-2xl shadow-amber-500/20 mb-8">
        <div className="flex flex-col h-full">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 ${i % 2 === 0 ? 'bg-[#cc0000]' : 'bg-white'}`}
            />
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-full bg-[#000080] flex items-center justify-center">
            <svg viewBox="0 0 30 30" className="w-10 h-10">
              <path
                d="M15 2 L17.5 10.5 L26 10.5 L19 16 L21.5 24.5 L15 19 L8.5 24.5 L11 16 L4 10.5 L12.5 10.5 Z"
                fill="#ffcc00"
                className="animate-pulse"
              />
              <path
                d="M15 5 Q5 15 15 25 Q25 15 15 5"
                fill="none"
                stroke="#ffcc00"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ffcc00] to-transparent animate-pulse" />
      </div>
      <h1 className="font-heading text-3xl font-bold text-white tracking-wide mb-2">
        MyAPI
      </h1>
      <p className="text-[#8b8fa3] text-sm font-sans animate-pulse">
        Memuatkan...
      </p>
    </div>
  )
}
