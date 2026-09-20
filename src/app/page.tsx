import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F6F3EC] text-[#111111] flex flex-col justify-between p-6 md:p-12 max-w-4xl mx-auto">
      {/* Brand Header */}
      <header className="flex items-center justify-between border-b-2 border-[#111111] pb-4">
        <div className="flex items-center space-x-2">
          <span className="font-mono font-bold tracking-tight text-xl bg-[#111111] text-[#F6F3EC] px-2 py-0.5 rounded-sm">
            CHAUKAS
          </span>
          <span className="font-hindi text-sm font-semibold text-[#111111]/70">
            चौकस
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/check"
            className="text-xs md:text-sm font-bold text-[#111111] hover:underline"
          >
            Check a Message →
          </Link>
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF5A1F] border border-[#FF5A1F] px-2 py-1 rounded">
            FIRE-DRILL 1.0
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="my-auto py-12 flex flex-col items-start space-y-8 max-w-2xl">
        <div className="space-y-4">
          <div className="inline-block bg-[#111111] text-[#F6F3EC] text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-sm">
            BEHAVIOURAL SIMULATION
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#111111] leading-[1.1]">
            Get scammed here. Never out there.
          </h1>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            href="/drill"
            className="inline-flex items-center justify-center min-h-[56px] px-8 py-4 bg-[#FF5A1F] text-white text-lg md:text-xl font-bold border-2 border-[#111111] rounded-md shadow-hard hover:opacity-95 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            Start the 3-minute drill
          </Link>
          <Link
            href="/check"
            className="inline-flex items-center justify-center min-h-[56px] px-6 py-4 bg-white text-[#111111] text-base md:text-lg font-bold border-2 border-[#111111] rounded-md shadow-hard hover:bg-[#F6F3EC] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            Check a message →
          </Link>
        </div>

        {/* Security / Privacy line */}
        <p className="text-sm md:text-base text-[#111111]/80 font-medium max-w-lg border-l-2 border-[#111111] pl-3">
          We never ask for your real PIN, OTP, phone number or bank. This is a simulation.
        </p>
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-[#111111] pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#111111]/70 font-mono gap-3">
        <span>© 2026 Chaukas · Tech for a Better Tomorrow</span>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/judge" className="hover:underline font-bold text-[#FF5A1F]">
            Judging this? Start here →
          </Link>
          <Link href="/check" className="hover:underline font-bold">
            Message Checker
          </Link>
          <Link href="/insights" className="hover:underline font-bold">
            Live Insights
          </Link>
          <span>100% Client-Side Simulation</span>
        </div>
      </footer>
    </main>
  );
}
