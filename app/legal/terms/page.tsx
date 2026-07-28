export const metadata = {
  title: 'Terms of use | Margasiri'
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      {/* PLACEHOLDER: replace with content reviewed by a lawyer before launch. */}
      <div className="rounded-2xl border border-vermillion bg-paper-light p-5">
        <p className="text-xs uppercase tracking-widest text-vermillion">Legal review required</p>
        <h1 className="mt-2 font-display text-4xl">Terms of use</h1>
        <p className="mt-3 text-sm opacity-75">This is structured placeholder content for product testing only.</p>
      </div>

      {['Using Margasiri', 'Accounts', 'Location and navigation', 'User contributions', 'Moderation', 'Service availability', 'Limitation of liability', 'Contact'].map((section) => (
        <section key={section} className="mt-6 rounded-xl border border-black/10 bg-paper-light p-5">
          <h2 className="font-display text-2xl">{section}</h2>
          <p className="mt-2 text-sm leading-relaxed opacity-75">
            Placeholder text. Replace this section with legally reviewed terms before production launch.
          </p>
        </section>
      ))}
    </main>
  );
}
