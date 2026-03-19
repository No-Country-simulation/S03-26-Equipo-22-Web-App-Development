import z from "zod";



export const registerSchema = z.object({
    mail: z.email().min(3).max(30),
    username: z.string().min(3).max(20),
    password: z.string().min(6).max(40),
    confirmPassword: z.string().min(6).max(40),
    termsAndConditions: z.boolean(),
    creationDate: z.date(),

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


export type registerFormType = z.infer<typeof registerSchema>;