
type Theme = {
  name: string
  label: string
  cssVars: {
    light: any
    dark: any
  }
}

export const themes: Theme[] = [
  {
    name: "light",
    label: "Light",
    cssVars: {
      light: {
        background: "hsl(234 43% 95%)",
        foreground: "hsl(231 48% 28%)",
        card: "hsl(0 0% 100%)",
        "card-foreground": "hsl(231 48% 28%)",
        popover: "hsl(0 0% 100%)",
        "popover-foreground": "hsl(231 48% 28%)",
        primary: "hsl(231 48% 48%)",
        "primary-foreground": "hsl(0 0% 100%)",
        secondary: "hsl(234 43% 90%)",
        "secondary-foreground": "hsl(231 48% 28%)",
        muted: "hsl(234 43% 90%)",
        "muted-foreground": "hsl(231 48% 40%)",
        accent: "hsl(36 100% 50%)",
        "accent-foreground": "hsl(0 0% 100%)",
        destructive: "hsl(0 84.2% 60.2%)",
        "destructive-foreground": "hsl(0 0% 98%)",
        border: "hsl(234 43% 85%)",
        input: "hsl(234 43% 88%)",
        ring: "hsl(231 48% 48%)",
      },
      dark: {
        background: "hsl(231 40% 10%)",
        foreground: "hsl(234 43% 95%)",
        card: "hsl(231 40% 15%)",
        "card-foreground": "hsl(234 43% 95%)",
        popover: "hsl(231 40% 10%)",
        "popover-foreground": "hsl(234 43% 95%)",
        primary: "hsl(234 43% 95%)",
        "primary-foreground": "hsl(231 48% 28%)",
        secondary: "hsl(231 40% 20%)",
        "secondary-foreground": "hsl(234 43% 95%)",
        muted: "hsl(231 40% 20%)",
        "muted-foreground": "hsl(234 43% 70%)",
        accent: "hsl(36 100% 55%)",
        "accent-foreground": "hsl(231 48% 10%)",
        destructive: "hsl(0 62.8% 30.6%)",
        "destructive-foreground": "hsl(0 0% 98%)",
        border: "hsl(231 40% 20%)",
        input: "hsl(231 40% 22%)",
        ring: "hsl(36 100% 55%)",
      },
    },
  },
]
