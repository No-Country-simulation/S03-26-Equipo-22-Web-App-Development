"use client"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon, Add01Icon, Settings01Icon, Logout01Icon, ChartIcon } from "@hugeicons/core-free-icons"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { ThemeToggle } from "./ThemeToggle"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
export default function HeaderNav(){

const session = {id: "marco", role: "visitor", img: null}
const role = session?.role || "visitor";


return(

    <header className="flex ml-64 border-b border-border /50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">

            <Link href={'/'}>
            {/* cambiar por logo */}
                <Image src={'placeholder.svg'} alt={"logo"} className="flex items gap-2" width={50} height={50}></Image>
            </Link>

        </div>

        <div className="flex flex-1 items-center justify-center max-w-md">
            <div className="relative w-full">
                <HugeiconsIcon 
                  icon={Search01Icon} 
                  strokeWidth={2}
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" 
                />
                <Input type="search" placeholder="Search projects..." className="w-full pl-9 bg-secondary/50 border-border/50" />
            </div>
        </div>

        <div className="flex items-center gap-2">

            <ThemeToggle></ThemeToggle>
        </div>

        <div>
            <Avatar>
                <AvatarImage src={session.img || "https://github.com/shadcn.png"} alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>

            </Avatar>
            {session ? (
                <Link href="/signout">Sign Out</Link>
            ): <Link href="/login">Sign in</Link>}

        </div>
    </div>
        
        
    </header>
)


}