import { T } from '@/components/LanguageProvider';

export const metadata = {
  title: 'Terms of use | Margasiri'
};

const sections = ['usingMargasiri', 'accounts', 'locationNavigation', 'userContributions', 'moderation', 'serviceAvailability', 'liability', 'contact'];

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      {/* PLACEHOLDER: replace with content reviewed by a lawyer before launch. */}
      <div className="rounded-2xl border border-vermillion bg-paper-light p-5">
        <p className="text-xs uppercase tracking-widest text-vermillion"><T k="legalReviewRequired" /></p>
        <h1 className="mt-2 font-display text-4xl"><T k="termsUse" /></h1>
        <p className="mt-3 text-sm opacity-75"><T k="legalPlaceholder" /></p>
      </div>

      {sections.map((section) => (
        <section key={section} className="mt-6 rounded-xl border border-black/10 bg-paper-light p-5">
          <h2 className="font-display text-2xl"><T k={section} /></h2>
          <p className="mt-2 text-sm leading-relaxed opacity-75"><T k="legalSectionPlaceholder" /></p>
        </section>
      ))}
    </main>
  );
}
