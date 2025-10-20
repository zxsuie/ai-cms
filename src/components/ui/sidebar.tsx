
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_WIDTH = "240px"
const SIDEBAR_WIDTH_COLLAPSED = "80px"

type SidebarContext = {
  open: boolean
  setOpen: (open: boolean) => void
  isMobile: boolean
  isHovering: boolean
  setIsHovering: (isHovering: boolean) => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(
  (
    {
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()
    const [open, setOpen] = React.useState(false)
    const [isHovering, setIsHovering] = React.useState(false);


    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        open,
        setOpen,
        isMobile,
        isHovering,
        setIsHovering,
      }),
      [open, setOpen, isMobile, isHovering, setIsHovering]
    )

    return (
      <TooltipProvider delayDuration={0}>
        <SidebarContext.Provider value={contextValue}>
          <div
            style={
              {
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              "flex min-h-svh w-full",
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </SidebarContext.Provider>
      </TooltipProvider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(
  (
    {
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, open, setOpen, setIsHovering, isHovering } = useSidebar()

    if (isMobile) {
      return (
        <Sheet open={open} onOpenChange={setOpen} {...props}>
          <SheetContent
            className="w-[240px] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
            side="left"
          >
            <SheetTitle className="sr-only">Main Menu</SheetTitle>
            <div className="flex h-full w-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      )
    }

    return (
      <div
        ref={ref}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={cn(
          "group hidden h-svh bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out md:fixed md:left-0 md:top-0 md:z-20 md:flex md:flex-col",
          isHovering ? "w-[240px]" : "w-[80px]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"


const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"main">
>(({ className, ...props }, ref) => {
  const { isHovering } = useSidebar();
  return (
    <main
      ref={ref}
      className={cn(
        "relative flex min-h-svh flex-1 flex-col bg-background transition-all duration-300 ease-in-out",
        "md:ml-[80px]",
        isHovering && "md:ml-[240px]",
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"


const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col gap-2 p-4 shrink-0", className)}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col gap-2 p-2 mt-auto shrink-0", className)}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"


const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("relative flex w-full min-w-0 flex-col px-2", className)}
      {...props}
    />
  )
})
SidebarGroup.displayName = "SidebarGroup"

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex w-full min-w-0 flex-col gap-1 px-2", className)}
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("group/menu-item relative", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"


const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  }
>(
  (
    {
      asChild = false,
      tooltip,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const { isMobile, isHovering } = useSidebar()

    const button = (
        <Comp
          ref={ref}
          className={cn(
            "flex w-full items-center gap-3 overflow-hidden rounded-xl p-2 text-left text-sm outline-none ring-sidebar-ring transition-colors duration-300 ease-in-out",
            "text-white/60 hover:text-white hover:bg-sidebar-accent",
            isHovering ? "justify-start pl-4" : "justify-center",
            "[&>svg]:size-6 [&>svg]:shrink-0",
            className
          )}
          {...props}
        >
          {children}
        </Comp>
    )

    if (!tooltip) {
      return button
    }

    if (typeof tooltip === "string") {
      tooltip = {
        children: tooltip,
      }
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          hidden={isHovering || isMobile}
          {...tooltip}
        />
      </Tooltip>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

export {
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  useSidebar,
}
