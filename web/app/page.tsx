import Image from "next/image";
import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";
export default function Home() {
  return (
        <main>
        
            <LoginForm></LoginForm>
            <RegisterForm></RegisterForm>
      </main>
    
  );
}
