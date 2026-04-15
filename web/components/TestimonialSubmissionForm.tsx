'use client'
import { useActionState } from "react";
import { TestimonialSubmission } from "@/app/actions/testimonials";

import {Card, CardContent,CardDescription, CardFooter, CardHeader,CardTitle} from '@/components/ui/card'
import { Field,FieldGroup,FieldLabel,FieldError, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function TestimonialSubmissionForm(){
    const [state,action,pending] = useActionState(TestimonialSubmission, undefined)

    return(

        <Card>

            <CardHeader>
            <CardTitle>Testimonial Submission Form</CardTitle>
            <CardDescription>A form for submitting testimonials for consideration</CardDescription>
            </CardHeader>

            <CardContent>
                <form action={action}>
                    <FieldGroup>

                        <Field>
                            <FieldLabel htmlFor="editors">Add Editors</FieldLabel>
                            <Input id="username" name="username" placeholder="Add Editors by username here"></Input>
                            <FieldDescription>Add up to 20 editors</FieldDescription>
                            {state?.errors?.editors && <FieldError >{state.errors.editors}</FieldError>}
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="image">Add Images</FieldLabel>
                            <Input id="image" name="image" placeholder="Add Image links here."></Input>
                            <FieldDescription>Add up to 20 Image links here.</FieldDescription>
                            {state?.errors?.editors && <FieldError >{state.errors.editors}</FieldError>}
                        </Field>


                        <Field>
                            <FieldLabel htmlFor="videos">Add Videos</FieldLabel>
                            <Input id="videos" name="videos" placeholder="Your Video Links Here"></Input>
                            <FieldDescription>Add up to 5 Video Links here.</FieldDescription>
                            {state?.errors?.editors && <FieldError >{state.errors.editors}</FieldError>}
                        </Field>

                    </FieldGroup>

                    <Button type="submit" variant="ghost">Submit</Button>
                </form>
            </CardContent>
        </Card>
    )
}