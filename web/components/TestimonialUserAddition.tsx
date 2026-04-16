'use client'
import { useActionState, useState } from "react";
import {Card, CardContent,CardDescription, CardFooter, CardHeader,CardTitle} from '@/components/ui/card'
import { Field,FieldGroup,FieldLabel,FieldError, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {  Popover,  PopoverContent,  PopoverDescription,  PopoverHeader,  PopoverTitle,  PopoverTrigger,
} from "@/components/ui/popover"
import { ListFieldManager } from "./ListFieldManager";
import { TestimonialUserAddition } from "@/app/actions/testimonials";
export function TestimonialUserAdditionComponent(){

const [isHidden,setHidden] = useState(false);
const [state,action,pending] = useActionState(TestimonialUserAddition, undefined)
const [editors, setEditors] = useState<string[]>([])
    


    return(
        <div>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline">Open Popover</Button>
                </PopoverTrigger>
                <PopoverContent className="w-64" align="start">
                    <PopoverHeader>
                        <PopoverTitle>Add Editors</PopoverTitle>
                        <PopoverDescription>Write in new users to invite as editors.</PopoverDescription>
                    </PopoverHeader>
                    <form action={action}>

                    
                    <FieldGroup>
                        <ListFieldManager label="Add Editors" description="Add up to 20 editors by username" placeholder="Enter username (6-20 chars)" items={editors} onAdd={(editor) => setEditors([...editors, editor])} onRemove={(index) => setEditors(editors.filter((_, i) => i !== index))} maxItems={20} minLength={6} maxLength={20} hiddenInputName="addedUsers" errors={state?.errors?.addedUsers}></ListFieldManager>
                        {state?.errors?.addedUsers && <FieldError>{state.errors.addedUsers}</FieldError>}
                    </FieldGroup>
                    </form>
                </PopoverContent>
            </Popover>
           
        </div>
    )
}