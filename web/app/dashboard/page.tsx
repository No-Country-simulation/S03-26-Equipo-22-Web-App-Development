import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from "next/image";
import Link from "next/link";


async function DashBoardUser(){
    //reworkear fetch a usefetch(url);
const session = {id: "marco", role: "admin"}
const role = session?.role || "visitor";
let caruselPersonal = [{title: "testimonioSampleAdmin",img: "", description: "descripcionCortaAdmin", href:"localhost:3000"}] 

    if(role == "user" || role == "admin"){
    const res = await fetch(`localhost:3000/api/testimonials/carousel/${session.id}`, {cache: "no-store"})
    caruselPersonal = await res.json()
    }
    
    return (
        <Carousel className= "flex justify-center" opts={{align:"center", loop:true}}>
            <CarouselContent>
                {caruselPersonal.map((testimonio,index) => (<CarouselItem key={index} className="md: basis1/2 lg:basis-1/4">
                <div className="p-1">
                    <Card>
                        <CardContent className="flex aspect-square items-center justify-center p-6">
                            <Link href={testimonio.href}>
                            <Image src={testimonio.img || 'placeholder.svg'} alt={testimonio.title} width={300} height={200}>
                            </Image>
                            <CardTitle className="text-4xl font-semibold">{testimonio.title}</CardTitle>
                            <CardDescription>{testimonio.description}</CardDescription>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
                </CarouselItem>))}
            </CarouselContent>
            <CarouselPrevious></CarouselPrevious>
            <CarouselNext></CarouselNext>
        </Carousel>
    )
}
export default async function Dashboard(){
    const session = {id: "marco", role: "visitor"}
    const role = session?.role || "visitor";
    let caruselGenerico = [{title: "testimonioSample",img: "", description: "descripcionCorta", href:"localhost:3000"}]
    
    

    
    const conseguirCarusel = async () => {
       const response = await fetch(`./api/testimonials/carousel`, {cache:"no-store"})
    caruselGenerico = await response.json()
       
    }
    
    // conseguirCarusel();

    return(

        <div className = "dashboard">
            
            {role == "admin" || role == "user" && (
                <DashBoardUser></DashBoardUser>
            )}
            <Carousel className= "flex justify-center" opts={{align:"center", loop:true}} >
                <CarouselContent >
                    {caruselGenerico.map((testimonio,index) => (
    
                        <CarouselItem key={index} className="md: basis1/2 lg:basis-1/4">
                            <div className="p-1">
                                <Card>
                                    <CardContent className="flex aspect-square items-center justify-center p-6">
                                        <Link href={testimonio.href}>
                                        <Image src={testimonio.img || 'placeholder.svg'} alt={testimonio.title} width={300} height={200}>
                                        </Image>
                                        <CardTitle className="text-4xl font-semibold">{testimonio.title}</CardTitle>
                                        <CardDescription>{testimonio.description}</CardDescription>
                                        </Link>

                                </CardContent>
                                </Card>
        
        
                            </div>
                    </CarouselItem>))}
                </CarouselContent>
                <CarouselPrevious></CarouselPrevious>
                <CarouselNext></CarouselNext>
            </Carousel>
                                                                                                                                                                   
            
        </div>
    )



    
}
