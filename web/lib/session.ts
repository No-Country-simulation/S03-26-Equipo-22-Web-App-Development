import 'server-only'
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from 'jose';
import { NextApiRequest } from 'next';

const key = process.env.SESSION_SECRET;
const encodedKey= new TextEncoder().encode(key);

export async function createSession(userId: string){
    
    const expiresAt = new Date(Date.now() + 60*60*12*1000)
    const cookieStore = await cookies()

}

export async function validateSession(req: Request){

    
    // read cookie, call cookie verification  - primero access cookie, despues refresh-cookie? alt fijarse fecha. y llamar refresh cookie si no.
    //retornar success o falla
}
export async function deleteSession(){
    //eliminar jwt, llamar nest endpoint.
}