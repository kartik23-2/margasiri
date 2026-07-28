import EditProfileForm from '@/components/EditProfileForm';

export const metadata = {
  title: 'Edit profile | Margasiri'
};

export default function EditProfilePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-4xl">Edit profile</h1>
      <p className="mt-2 text-sm opacity-70">Update your public Margasiri account details.</p>
      <EditProfileForm />
    </main>
  );
}
