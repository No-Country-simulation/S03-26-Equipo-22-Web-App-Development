"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {  Sidebar,  SidebarContent,  SidebarFooter,  SidebarGroup,  SidebarGroupContent,  SidebarGroupLabel,  SidebarHeader,  SidebarMenu,  SidebarMenuButton,  SidebarMenuItem,  SidebarSeparator,  useSidebar,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  Home01Icon,
  FolderLibraryIcon,
  ChartIcon,
  Logout01Icon,
  Add01Icon,
  ProfileIcon,
} from "@hugeicons/core-free-icons"

export default function adminSidebar(){

    const session = {id: "marco", role: "admin"}
    const role = session?.role || "visitor";
    const pathname = usePathname()
    const adminNavItems = [{title: "Statistics", href:"/statistics", icon: ChartIcon, requiresAuth: true}]





    return(
        <div>
            <SidebarSeparator></SidebarSeparator>
            <SidebarGroup>
              <SidebarGroupLabel>Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminNavItems.map((navItem) => {if(role != "admin") return null
                 return(
                <SidebarMenuItem key ={navItem.href}>
                  <SidebarMenuButton asChild isActive={pathname === navItem.href}>
                    <Link href={navItem.href}>
                    <HugeiconsIcon icon={navItem.icon} strokeWidth={2}></HugeiconsIcon>
                    <span>{navItem.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>)
        })}
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
</div>
        
        
    )
}