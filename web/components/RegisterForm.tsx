
"use client"
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, registerFormType } from "@/lib/schemas/registerSchema";
import {Controller, useForm} from "react-hook-form";
import {toast } from "sonner";
import * as z from "zod";
import { Button } from "./ui/button";
import {Card, CardContent,CardDescription, CardFooter, CardHeader,CardTitle} from "./ui/card"
import { Field,FieldDescription,FieldGroup,FieldLabel,FieldError } from "./ui/field";
import { Input } from "./ui/input";
import { InputGroup, InputGroupAddon, InputGroupText } from "./ui/input-group";
import { Checkbox } from "./ui/checkbox";
import SubmitButton from "./SubmitButton";
function RegisterForm(){

    const form = useForm<registerFormType>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            mail: "",
            username: "",
            password: "",
            confirmPassword: "",
            termsAndConditions: false,
            creationDate: new Date()
        }
    })

    function onSubmit(data: z.infer<typeof registerSchema>){
       
       

        

        form.reset();
    }
    
    return(
        <Card>
            <CardHeader>
                <CardTitle>Register</CardTitle>
                <CardDescription>Fill out your details and click submit to make an account.</CardDescription>
            </CardHeader>
            <CardContent>
                <form id="registerForm" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Controller name="mail" control={form.control} render={({field,fieldState}) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="form-visual-mail"></FieldLabel>
                                <Input {...field} id="form-visual-mail" aria-invalid={fieldState.invalid} placeholder="Your Email Address" autoComplete="off"></Input>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]}></FieldError>
                                )}
                            </Field>
                        )}>

                        </Controller>

                        <Controller name="username" control={form.control} render={({field,fieldState}) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="form-visual-username"></FieldLabel>
                                <Input {...field} id="form-visual-username" aria-invalid={fieldState.invalid} placeholder="your username here." autoComplete="off"></Input>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]}></FieldError>
                                )}
                            </Field>
                        )}>

                        </Controller>
                        
                        <Controller name="password" control={form.control} render={({field,fieldState}) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="form-visual-password"></FieldLabel>
                                <Input {...field} id="form-visual-password" aria-invalid={fieldState.invalid} placeholder="your password here." autoComplete="off"></Input>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]}></FieldError>
                                )}
                            </Field>
                        )}>
                        </Controller>

                        <Controller name="confirmPassword" control={form.control} render={({field,fieldState}) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="form-visual-confirmPassword">Confirm Password</FieldLabel>
                                <Input {...field} id="form-visual-confirmPassword" aria-invalid={fieldState.invalid} placeholder="also your password here." autoComplete="off"></Input>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]}></FieldError>
                                )}
                            </Field>
                        )}>
                        </Controller>

                        <Controller name="termsAndConditions" control={form.control} render={({field,fieldState}) => (
                            <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="termsAndConditions">Terms and Conditions</FieldLabel>
                                <Checkbox id="termsAndConditions" aria-invalid={fieldState.invalid} checked={field.value} onCheckedChange={field.onChange}></Checkbox>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]}></FieldError>
                                )}
                            </Field>

                        )}></Controller>


                    </FieldGroup>
                </form>
            </CardContent>

            <CardFooter>
                <Field orientation="horizontal">
                    <SubmitButton formName="registerForm"></SubmitButton>
                </Field>
            </CardFooter>
        </Card>
    )
}

export default RegisterForm;