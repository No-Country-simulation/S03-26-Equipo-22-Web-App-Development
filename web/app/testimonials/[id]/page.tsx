import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { redirect } from "next/navigation";

type ImageItem = {
  url: string;
  title: string;
  description: string;
};

type VideoItem = {
    url: string,
    title: string,
    description: string
}

type Testimonial = {
  author: string;
  title: string;
  editors: string[];
  description: string;
  images: ImageItem[];
  videos: VideoItem[];
};

export default async function TestimonialPage({ params }: { params: Promise<{ tag: string }> }){
    const id = await params;
    const res = await fetch(`${process.env.NEST_API_URL}/testimonial/${id}`)

    if(!res.ok){

        redirect('/dashboard')
    }
    const data: Testimonial = await res.json();
    const exampleImage = [{url: "placeholder.svg", title:"A placeholder", description: "DescriptivePlaceholder." }];
    const exampleVideo = [{url: "videoVideo", title: "PlaceholderVideo", description: "placeholderVideo"}]
    const session = {id: "marco", role: "admin"}
    const role = session?.role || "visitor";


    return(
        <Card>
            <CardHeader>
                    <CardTitle>{data.title}</CardTitle>
                    <CardDescription>{data.description}</CardDescription>
            </CardHeader>

            <CardContent>

                
                <div className="imageCarousel">
                        <Label>Images</Label>
                        <Carousel className= "flex justify-center" opts={{align:"center", loop:true}}>
                            <CarouselContent>
                                {/* replace with data.images.map */}
                                {exampleImage.map((image,index) => (

                                    <CarouselItem key={index} className="md: basis1/2 lg:basis-1/4">
                                        <div className="p-1">
                                            
                                            <Image src={image.url || 'placeholder.svg'} alt={image.title} width={300} height={200}></Image>
                                            <p>{image.description}</p>
                                        </div>
                                    </CarouselItem>) )}

                            </CarouselContent>
                            <CarouselPrevious></CarouselPrevious>
                            <CarouselNext></CarouselNext>
                        </Carousel>


                </div>
                <div className="videoCarousel">
                            <Label>Videos</Label>
                            <Carousel className="flex justify-center w-full" opts={{align:"center", loop:true}}>
                                    
                                    <CarouselContent>
                                        {/* same idea as data images - replace with videos. */}
                                        {exampleVideo.map((video,index) => (
                                            <CarouselItem key={index} className="md: basis1/2 lg:basis-1/4">
                                                <div className="p-1">
                                                <iframe src={video.url} allow="autoplay 'none' "allowFullScreen>
                                                    <Label>{video.title}</Label>
                                                    <p>{video.description}</p>

                                                </iframe>
                                                    
                                                    
                                                </div>
                                            </CarouselItem>) )}
                                    </CarouselContent>
                                    <CarouselPrevious></CarouselPrevious>
                                    <CarouselNext></CarouselNext>
                            </Carousel>
                </div>
            </CardContent>
        </Card>
    )

}

