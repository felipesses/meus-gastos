import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex justify-center items-center py-8">
      <SignIn />
    </div>
  );
}
