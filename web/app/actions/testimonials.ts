import { testimonialSubmissionFormSchema,testimonialUserAdditionSchema } from "@/lib/definitions/testimonialDefinitions";
import { testimonialSubmissionFormState,testimonialUserAdditionFormState } from "@/lib/definitions/testimonialDefinitions";
import z from 'zod'
export async function TestimonialSubmission(state: testimonialSubmissionFormState,  formData: FormData){

    const validSubmission = testimonialSubmissionFormSchema.safeParse(
        {
            author: formData.get('author'),
            images: formData.get('images'),
            editors: formData.get('editors'),
            videos: formData.get('videos')
            
        
        }
    )

    if(!validSubmission.success){
        return {
            errors: z.flattenError(validSubmission.error).fieldErrors
        }
    }

    const {author, images, editors, videos} = validSubmission.data;

    try{

        const res = await fetch(`${process.env.NEST_API_URL}/testimonial/submit`,{
            method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({author, images, editors, videos})
        })

    }catch(error){

        console.log('Could not submit testimonial. Please try again later.');
    }

}

export async function TestimonialUserAddition(state: testimonialUserAdditionFormState, formData:FormData){
    const validSubmission = testimonialUserAdditionSchema.safeParse(
    {
        addedUsers: formData.get('addedUsers'),
    
    }
)
    if(!validSubmission.success){
        return {
            errors: z.flattenError(validSubmission.error).fieldErrors
        }
    }

    const {addedUsers} = validSubmission.data

    try{
            const res = await fetch(`${process.env.NEST_API_URL}/testimonial/submit`,{
            method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({addedUsers})
        })
    }catch(error){
    console.log('Could not invite additional collaborators. Please try again later.');
    }
}