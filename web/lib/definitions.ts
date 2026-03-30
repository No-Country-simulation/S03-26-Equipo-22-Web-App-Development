import * as z from 'zod';

export const loginSchema = z.object({
    username: z.string().min(6).max(20).or(z.email()),
    password: z.string().min(6).max(40)
})

export type loginFormType = z.infer<typeof loginSchema>;

export type loginFormState = | {
      errors?: {
        username?: string[]
        email?: string[]
        password?: string[]
        confirmPassword?: string[]
        termsAndConditions?: string[]
        
      }
      message?: string
    }
  | undefined

export const registerFormSchema = z.object({
    email: z.email().min(3).max(30),
    username: z.string().min(3).max(20),
    password: z.string().min(6).max(40),
    confirmPassword: z.string().min(6).max(40),
    termsAndConditions: z.boolean(),
    creationDate: z.date().default(() => new Date()),

}).superRefine((val,ctx) => {
    if(val.confirmPassword != val.password){
        ctx.addIssue({
            code: "custom",
            message: "Passwords must match.",
            path: ["confirmPassword"]
        })
    }
    if(val.termsAndConditions != true){
        ctx.addIssue({
            code: "custom",
            message: "You must agree to our terms and conditions to make use of our services.",
            path: ["termsAndConditions"]
        })
    }
})


export type registerFormState = | {
      errors?: {
        username?: string[]
        email?: string[]
        password?: string[]
        confirmPassword?: string[]
        termsAndConditions?: string[]
        
      }
      message?: string
    }
  | undefined