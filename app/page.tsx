import SignIn from "../components/sign-in";
import { SignOut } from "../components/sign-out";

export default function Home() {
  return (
    <div>
      {/* Sign In/Out Buttons */}
      <SignIn />
      <SignOut />
    </div>
  );
}
