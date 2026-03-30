import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {validateSession} from "@/lib/session"

export const config = {
    matcher: ["",""]
    // : '/api/:function*' para limitar a rutas que empiezen con /api? considerar regex para excluir. No tiene porque ser exclusivamente un array, pero bueno.
}
//listar rutas para validar de antes?
export function proxy(request: Request){

    if(!validateSession(request)){

        return Response.json(
            {success: false, message: 'Authentication Failed.'},
            {status: 401}
        )
        
    }
    //return nextResponse.redirect(request.nextUrl)
}