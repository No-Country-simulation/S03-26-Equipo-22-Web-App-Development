
import { registerFormState,registerFormSchema } from "@/lib/definitions";
import {loginFormState,loginSchema} from "@/lib/definitions";
import { toast } from "sonner";
import z from 'zod'

export async function signin(state: loginFormState,formData: FormData){
    const validatedFields = loginSchema.safeParse({

        username: formData.get('username'),
        password: formData.get('password')
    })

    if(!validatedFields.success){

        return {
            errors: z.flattenError(validatedFields.error).fieldErrors
        }
    }

    const {username, password} = validatedFields.data;

    try{
        const res = await fetch(`${process.env.NEST_API_URL}/auth/login`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username, password})
                }
    )

        //llamar metodo verificacion cookies?
    }catch(error){
        //cambiarlo??
        
        console.log("there was an error loging you in.");
    }
}




export async function signup(state: registerFormState, formData: FormData){
    // const bcrypt = require('bcrypt');
    // const saltrounds = 12;

    const validatedFields = registerFormSchema.safeParse({
        email: formData.get('email'),
        username: formData.get('username'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        termsAndConditions: formData.get('termsAndConditions') === null ? false: true,
        
    })

    console.log(formData);
    if(!validatedFields.success){
        // come back to this if zod issues
        
        return {
            errors: z.flattenError(validatedFields.error).fieldErrors,
        }
    }

    const {username, email, password} = validatedFields.data;

    // const hashedPassword = await bcrypt.hash(password, saltrounds);

    try{
        const res = await fetch(`${process.env.NEST_API_URL}/auth/register`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username, email, password})
            }

            )
        if(!res.ok){
            
            console.log("there was an error creating your account.");
        }


    }catch(error){
        console.log(error);
       
    }

}