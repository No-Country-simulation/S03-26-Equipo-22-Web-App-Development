'use client'
import { useActionState, useState } from "react";
import { TestimonialUpdateFormSubmission } from "@/app/actions/testimonials";


import {Card, CardContent,CardDescription, CardFooter, CardHeader,CardTitle} from '@/components/ui/card'
import { Field,FieldGroup,FieldLabel,FieldError, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ListFieldManager } from "./ListFieldManager";

const isValidUrl = (string: string) => {
    try {
        new URL(string)
        return true
    } catch {
        return false
    }
}

type TestimonialFormProps = {
  id: string
  initialEditors: string[];
  initialImages: string[];
  initialVideos: string[];
};


export function TestimonialUpdateForm({ initialEditors = [], initialImages = [], initialVideos = [], }: TestimonialFormProps){
    
    const [state,action,pending] = useActionState(TestimonialUpdateFormSubmission, undefined)

    const [editors, setEditors] = useState<string[]>(initialEditors || [])
    
    
    const [images, setImages] = useState<string[]>(initialImages || [])
    
    
    const [videos, setVideos] = useState<string[]>(initialVideos || [])

    return(


        <Card>


            <CardHeader>
                <CardTitle>Editing Testimonial</CardTitle>
            <   CardDescription>A Form for editing your testimonials</CardDescription>
            </CardHeader>


            <CardContent>
                <form action={action}>
                    <FieldGroup>


                     
                     
                            <ListFieldManager label="Add Editors" description="Add up to 20 editors by username" placeholder="Enter username (6-20 chars)" items={editors} onAdd={(editor) => setEditors([...editors, editor])} onRemove={(index) => setEditors(editors.filter((_, i) => i !== index))} maxItems={20} minLength={6} maxLength={20} hiddenInputName="editors" errors={state?.errors?.editors} ></ListFieldManager>
                     
                            {state?.errors?.editors && <FieldError >{state.errors.editors}</FieldError>}
                       
                       
                            
                            <ListFieldManager  label="Add Images"  description="Add up to 20 image URLs (Google Drive only)"  placeholder="Enter image URL"  items={images}  onAdd={(image) => setImages([...images, image])}  onRemove={(index) => setImages(images.filter((_, i) => i !== index))}  maxItems={20} minLength={6} validate={isValidUrl}  validationMessage="Please enter a valid URL"  hiddenInputName="images"  errors={state?.errors?.images}></ListFieldManager>
                            
                            {state?.errors?.images && <FieldError >{state.errors.images}</FieldError>}
                       




                        
                        <ListFieldManager label="Add Videos"  description="Add up to 5 video URLs"  placeholder="Enter video URL"  items={videos}  onAdd={(video) => setVideos([...videos, video])}  onRemove={(index) => setVideos(videos.filter((_, i) => i !== index))}  maxItems={5}  validate={isValidUrl} minLength={6} validationMessage="Please enter a valid URL"  hiddenInputName="videos"  errors={state?.errors?.videos}></ListFieldManager>
                        
                            {state?.errors?.videos && <FieldError >{state.errors.videos}</FieldError>}
                        


                    </FieldGroup>
                    <Button type="submit" variant="ghost">Submit</Button>
                </form>
            </CardContent>
        </Card>
    )
}








