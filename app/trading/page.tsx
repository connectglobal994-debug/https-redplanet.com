export default function TradingPage() {
  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-5 py-12 pb-32 space-y-8">
      <header className="space-y-3 border-b border-white/10 pb-7">
        <p className="text-xs tracking-[0.3em] uppercase text-neonCyan">Red Planet Markets</p>
        <h1 className="text-3xl sm:text-5xl font-black text-white">
          Expert Sniper <span className="text-marsRed">Pro</span>
        </h1>
        <p className="max-w-3xl text-neutral-400">
          A secure dashboard for the Python trading engine and MetaTrader 5. Broker data and
          controls will appear only after an authenticated bridge is connected and verified.
        </p>
      </header>

      <section className="rounded-3xl border border-amber-400/30 bg-amber-400/5 p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="text-sm font-bold uppercase tracking-wider text-amber-300">Bridge not connected</span>
        </div>
        <h2 className="text-xl font-bold text-white">Trading is currently in setup mode</h2>
        <p className="text-sm leading-6 text-neutral-300">
          No MetaTrader 5 account is connected to this website. The figures and activity shown
          here will remain unavailable until the private Python service reports verified account
          telemetry. This page cannot place, modify or close trades.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-3">
          <h3 className="font-bold text-white">Connection requirements</h3>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-neutral-400">
            <li>Run the Python engine on a secured Windows VPS with MT5 installed.</li>
            <li>Connect a demo broker account first; keep credentials off the website.</li>
            <li>Expose a private authenticated API with health and read-only account endpoints.</li>
            <li>Verify account identity, currency, balance, equity and open positions.</li>
            <li>Complete risk limits, audit logging and emergency-stop tests before enabling commands.</li>
          </ol>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-3">
          <h3 className="font-bold text-white">Safety defaults</h3>
          <ul className="space-y-2 text-sm text-neutral-400">
            <li>• Demo mode before any live account.</li>
            <li>• Read-only access until the bridge is independently verified.</li>
            <li>• No broker passwords or API secrets in browser code.</li>
            <li>• No trade commands without authenticated roles and server-side risk checks.</li>
            <li>• Every approved action must be recorded in an audit trail.</li>
          </ul>
        </article>
      </section>

      <p className="text-xs text-neutral-500">
        Status: integration pending. This dashboard intentionally does not display simulated
        balances, fabricated market news, fake heartbeats or pretend execution logs.
      </p>
    </main>
  );
}
