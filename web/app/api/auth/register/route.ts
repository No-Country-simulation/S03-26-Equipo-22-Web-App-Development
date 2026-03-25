import type {NextApiRequest, NextApiResponse} from 'next';
import { registerSchema } from '@/lib/schemas/registerSchema';
export async function POST(req: Request){
    try{
        
        const body = await req.json();

        const parsedBody = registerSchema.safeParse(body);

        if(!parsedBody.success){
            return new Response(
                JSON.stringify({error: parsedBody.error}),
                {status: 400}
            );
        }



        
        const res = await fetch(`${process.env.NEST_API_URL}/auth/register`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(parsedBody.data)

        })
        
        const data = await res.json();
        return new Response(JSON.stringify(data), {status: res.status})

    }catch(error){
        return new Response(
            JSON.stringify({error: "Internal Server Error"}),
            {status: 500}
        )
    }
}