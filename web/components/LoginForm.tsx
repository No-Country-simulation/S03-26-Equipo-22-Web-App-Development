"use client"
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, loginFormType } from "@/lib/schemas/loginSchema";
import {Controller, useForm} from "react-hook-form";
import {toast } from "sonner";
import * as z from "zod";
import { Button } from "./ui/button";
import {Card, CardContent,CardDescription, CardFooter, CardHeader,CardTitle} from "./ui/card"
import { Field,FieldGroup,FieldLabel,FieldError } from "./ui/field";
import { Input } from "./ui/input";
import SubmitButton from "./SubmitButton";



function LoginForm(){

    const form = useForm<loginFormType>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: "",
        }

    })

    function onSubmit(data: z.infer<typeof loginSchema>) {
        console.log("hello");
       //Volver a esto despues toast("Login attempt successful")
       form.reset();
    }

    return(
        <Card>
            <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Use your Username and password to login</CardDescription>

            </CardHeader>

            <CardContent>
                <form id="loginFormVisual" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Controller name="username" control={form.control} 
                        render ={({field, fieldState}) => (
                            <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="loginForm-Visual">Username</FieldLabel>
                                    <Input {...field} id="loginForm-Visual-Username" aria-invalid={fieldState.invalid} placeholder="yourusername" autoComplete="off"></Input>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]}></FieldError>
                                    )}
                            </Field>
                            
                        )}
                        ></Controller>

                        <Controller name="password" control = {form.control} 
                        render = {({field,fieldState}) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="loginform-Visual">Password</FieldLabel>
                                <Input {...field} id="loginForm-Visual-Password" aria-invalid={fieldState.invalid} placeholder="yourpassword" autoComplete="off"></Input>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]}></FieldError>
                                )}
                            </Field>
                        )}
                        >

                        </Controller>
                    </FieldGroup>
                </form>
            </CardContent>
            <CardFooter>
                <Field orientation="horizontal">
                        <SubmitButton formName="loginFormVisual"></SubmitButton>
                </Field>
            </CardFooter>
        </Card>
        
    )
}

export default LoginForm;