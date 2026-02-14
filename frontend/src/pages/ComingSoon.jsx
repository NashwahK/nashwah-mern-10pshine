function ComingSoon() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 to-zinc-900 px-5">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent">
          PENDOWN
        </h1>
        <div className="w-16 h-0.5 bg-white mx-auto mb-8"></div>
        <p className="text-lg md:text-xl font-light tracking-wider text-gray-400 mb-4">
          Something worth waiting for
        </p>
        <p className="text-sm md:text-base font-medium tracking-widest uppercase text-gray-600">
          Coming Soon
        </p>
      </div>
    </div>
  );
}

export default ComingSoon;
