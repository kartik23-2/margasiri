import EditProfileForm from '@/components/EditProfileForm';
import { T } from '@/components/LanguageProvider';

export const metadata = {
  title: 'Edit profile | Margasiri'
};

export default function EditProfilePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-4xl"><T k="editProfile" /></h1>
      <p className="mt-2 text-sm opacity-70"><T k="updatePublicProfile" /></p>
      <EditProfileForm />
    </main>
  );
}
