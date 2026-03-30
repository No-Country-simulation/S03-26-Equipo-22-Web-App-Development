'use client'
import { useActionState } from "react";
import { signup } from "../actions/auth";
import {Card, CardContent,CardDescription, CardFooter, CardHeader,CardTitle} from '@/components/ui/card'
import { Field,FieldGroup,FieldLabel,FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SignupForm() {
const [state,action,pending] = useActionState(signup, undefined)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>Fill out your detail and click submit to register</CardDescription>

      </CardHeader>
      <CardContent>
    <form action={action}>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input id="username" name="username" placeholder=" your Username"></Input>
          {state?.errors?.username && <FieldError >{state.errors.username}</FieldError>}
        </Field>

        <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" name="email" type="email" placeholder="Your Email" />
            {state?.errors?.email && <FieldError>{state.errors.email}</FieldError>}
        </Field>

        <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input id="password" name="password" type="password"  placeholder="your password"/>
            {state?.errors?.password && (<ul>{state.errors.password.map((error,index) => (<FieldError key={index}>{error}</FieldError>))}</ul>)}
        </Field>

        <Field>
            <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
            <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="your password, again" />
            {state?.errors?.confirmPassword && (<ul>{state.errors.confirmPassword.map((error,index) => (<FieldError key={index}>{error}</FieldError>))}</ul>)}
        </Field>
        <Field>
            <FieldLabel htmlFor="termsAndConditions">Terms And Conditions</FieldLabel>
            <Input id="termsAndConditions" name="termsAndConditions" type="checkbox"/>
            <br></br>
            {state?.errors?.termsAndConditions && <FieldError>{state.errors.email}</FieldError>}
        </Field>
      </FieldGroup>

      <Field>
        <FieldLabel>By clicking here, you agree to the terms and conditions</FieldLabel>
        
        <Button disabled={pending} type="submit">Sign Up</Button>
      </Field>
      
    </form>
    </CardContent>
    </Card>
  )
}