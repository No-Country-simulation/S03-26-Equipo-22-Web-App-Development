import z from "zod";
import useApi from "./useApi";
import { loginSchema } from "@/lib/schemas/loginSchema";
import { registerSchema } from "@/lib/schemas/registerSchema";

export function useAuth(){

    const api = useApi();
    const login =  async (data: z.infer<typeof loginSchema>) => {
        return api.request("/api/auth/login", {method: "POST", headers: {"Content-Type": "application/json", body: JSON.stringify(data)}});

    }

    const register = async (data: z.infer<typeof registerSchema>) => {
        return api.request("/api/auth/register", {method: "POST", headers: {"Content-Type": "application/json", body: JSON.stringify(data)}});
    }

    return {...api,login,register};
}