import z from "zod";



export const loginSchema = z.object({
    username: z.string().min(6).max(20).or(z.email()),
    password: z.string().min(6).max(40)
})

export type loginFormType = z.infer<typeof loginSchema>;