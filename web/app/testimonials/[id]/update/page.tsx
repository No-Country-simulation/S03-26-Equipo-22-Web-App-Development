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

export default async function EditTestimonialPage({ params }: { params: { id: string } }) {
    const session = {id: "marco", role: "admin"}
    const role = session?.role || "visitor";
    if(role == "visitor"){
        redirect('/dashboard')
    }
    const id = await params;

    const res = await fetch(`${process.env.NEST_API_URL}/testimonial/${id}`)
    if(!res.ok){
    redirect('/dashboard')
    }
    const data: Testimonial = await res.json(); 

    if(!data.editors.includes(session.id) || !(data.author == session.id)){
        redirect('dashboard');
    }

 const exampleImage = [{url: "placeholder.svg", title:"A placeholder", description: "DescriptivePlaceholder." }];
 const exampleVideo = [{url: "videoVideo", title: "PlaceholderVideo", description: "placeholderVideo"}]



  return {

            

  };
}