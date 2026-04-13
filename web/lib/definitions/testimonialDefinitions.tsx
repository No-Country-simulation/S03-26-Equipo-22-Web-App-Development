import * as z from 'zod';

const allowedImageDomains = ["https://drive.google.com"]
const allowedVideoDomains = ["youtube.com", "https://drive.google.com", "https://onedrive.live.com"]

const isAllowedDomain = (url: string) => {
 return allowedImageDomains.includes(url);
}
const isAllowedVideoDomain = (url: string) => {
    return allowedVideoDomains.includes(url);
}
export const testimonialSubmissionFormSchema = z.object({
    author: z.string().min(6).max(20),
    images: z.array(z.url().refine(
        url => isAllowedDomain(url), {message: "Invalid Image Domain."})).max(20).nonempty(),
    editors: z.array(z.string().min(6).max(20)).max(20),

    videos: z.array(z.url().refine(url => isAllowedVideoDomain(url), {message: "Invalid video source."})).max(5),

    creationDate: z.date().default(() => new Date()),


})

export type testimonialFormType = z.infer<typeof testimonialSubmissionFormSchema>;

export type testimonialSubmissionFormState = | {

    errors?: {
        author?: string[],
        images?: string[],
        editors?: string[],
        videos?: string[],

    }
    message?: string
} | undefined


//for adding users as editors/ admins on a given testimonial.

export const testimonialUserAdditionSchema = z.object({
    addedUsers: z.array(z.string().min(6).max(20)).max(20),
    
})
export type testimonialUserAdditionType = z.infer<typeof testimonialUserAdditionSchema>;

export type testimonialUserAdditionFormState = | {


    errors?: {
        addedUsers?: string[],
    }
    message?: string
} | undefined