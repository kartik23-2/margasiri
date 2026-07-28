export const metadata = {
  title: 'Privacy notice | Margasiri'
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      {/* PLACEHOLDER: replace with content reviewed by a lawyer before launch. */}
      <div className="rounded-2xl border border-vermillion bg-paper-light p-5">
        <p className="text-xs uppercase tracking-widest text-vermillion">Legal review required</p>
        <h1 className="mt-2 font-display text-4xl">Privacy notice</h1>
        <p className="mt-3 text-sm opacity-75">
          This placeholder is structured for an app that uses live location, Google sign-in, and saved/visited place data.
        </p>
      </div>

      {[
        'Data collected',
        'How data is used',
        'Live location handling',
        'Saved and visited places',
        'User contributions',
        'Data retention and deletion',
        'User rights under India DPDP Act',
        'Contact'
      ].map((section) => (
        <section key={section} className="mt-6 rounded-xl border border-black/10 bg-paper-light p-5">
          <h2 className="font-display text-2xl">{section}</h2>
          <p className="mt-2 text-sm leading-relaxed opacity-75">
            Placeholder text. Replace this section with privacy language reviewed by counsel before launch.
          </p>
        </section>
      ))}
    </main>
  );
}
