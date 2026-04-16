import { testimonialSubmissionFormSchema,testimonialUpdateFormSchema,testimonialUserAdditionSchema } from "@/lib/definitions/testimonialDefinitions";
import { testimonialSubmissionFormState,testimonialUserAdditionFormState } from "@/lib/definitions/testimonialDefinitions";
import z from 'zod'
export async function TestimonialSubmission(state: testimonialSubmissionFormState,  formData: FormData){

        console.log(formData);

    const validSubmission = testimonialSubmissionFormSchema.safeParse(
        {
            author: formData.get('author'),
            images: formData.getAll('images'),
            editors: formData.getAll('editors'),
            videos: formData.getAll('videos')
            
        
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
        addedUsers: formData.getAll('addedUsers'),
    
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

//update form

export async function TestimonialUpdateFormSubmission(state: testimonialSubmissionFormState,  formData: FormData){
    //check session.
      console.log(formData);
         const validSubmission = testimonialUpdateFormSchema.safeParse(
             {
                 author: formData.get('author'),
                 images: formData.getAll('images'),
                 editors: formData.getAll('editors'),
                 videos: formData.getAll('videos')

            
             }
         )

         if(!validSubmission.success){
           return {
               errors: z.flattenError(validSubmission.error).fieldErrors
           }
            }

            const { images, editors, videos} = validSubmission.data;

            try{
    const res = await fetch(`${process.env.NEST_API_URL}/testimonial/submit`,{
        method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ images, editors, videos})
        })
        }catch(error){
            console.log('Could not submit updates. Please try again later.');
        }
}