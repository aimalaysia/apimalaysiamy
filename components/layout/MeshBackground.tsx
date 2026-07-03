export function MeshBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute inset-0 bg-[#0a0e27]" />
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-amber-500/8 to-transparent blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-violet-500/6 to-transparent blur-3xl" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-amber-500/4 via-violet-500/4 to-transparent blur-3xl" />
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
        <defs>
          <pattern id="grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M60 0L0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white" />
            <path d="M0 0L60 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  )
}
