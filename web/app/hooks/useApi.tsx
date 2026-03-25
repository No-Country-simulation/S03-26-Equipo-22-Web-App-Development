

import { useState } from "react";


function useApi(){
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

async function request(url: string,options:RequestInit){
    setIsLoading(true);
    setError(null);

    try{
        const res = await fetch(url,options);

        if(!res.ok){
            throw new Error("Login failed");
        }

        //come back to fit this into a session

        const result = await res.json();

        return result;

    }catch(err){
        if(err instanceof Error){
            setError(err.message);
            throw err;
        }else{
            setError("Something went wrong");
        }
        
        
    }finally{
        setIsLoading(false);
    }

}


return {request,isLoading,error}


}

export default useApi;