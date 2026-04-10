"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {  Sidebar,  SidebarContent,  SidebarFooter,  SidebarGroup,  SidebarGroupContent,  SidebarGroupLabel,  SidebarHeader,  SidebarMenu,  SidebarMenuButton,  SidebarMenuItem,  SidebarSeparator,  useSidebar,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon,  Home01Icon,  ProfileIcon, } from "@hugeicons/core-free-icons"
import AdminSidebar from "./AdminSidebar"

export default function userSidebar(){
  const session = {id: "marco", role: "admin"}
  const role = session?.role || "visitor";
  const pathname = usePathname()
  //para merge con auth
  // const session = await validateSession()
  // const role = session?.role 

    const navItems = [
        {title: "New Project", href: "/testimonial",icon: Add01Icon, requiresAuth: true,}, 
        {title: "Dashboard", href:"/dashboard", icon: Home01Icon, requiresAuth: false},
        {title: "Profile", href: "/profile", icon: ProfileIcon, requiresAuth: true}
        ]

    
        
    const {setOpen} = useSidebar()





    return(
        
        <Sidebar collapsible="icon" onMouseEnter={ () => setOpen(true)} onMouseLeave={() => setOpen(false)}>
            {/* <SidebarHeader /> */}
            <SidebarContent >
              <SidebarGroup /> 
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarGroupContent>

                    <SidebarMenu>
                                {navItems.map((navlink,index) => (
                                  (<SidebarMenuItem key={navlink.href}></SidebarMenuItem>)
                                ))}
                                
                                {navItems.map((navLink) => { if(role == "visitor" && navLink.requiresAuth == true ) return null
                                  //investigar - otro modo manejar isActive?
                                  return (<SidebarMenuItem key={navLink.href}>
                                          <SidebarMenuButton asChild isActive={pathname === navLink.href}>
                                            <Link href={navLink.href}>
                                            <HugeiconsIcon icon={navLink.icon}></HugeiconsIcon>
                                            <span>{navLink.title}</span>
                                            </Link>
                                          </SidebarMenuButton>
                                  </SidebarMenuItem>)})}
                                
                    </SidebarMenu>
                </SidebarGroupContent>
              <SidebarGroup />

              {session.role === "admin" && (
                (<AdminSidebar></AdminSidebar>)                                                         
              )}
            </SidebarContent>
            <SidebarFooter />
        </Sidebar>
        
    )

    
    
}