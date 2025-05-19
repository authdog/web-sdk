// import { useState, useEffect } from "react"
import type { Story } from "@ladle/react"
import { LoginForm } from "../components/flow/login"
import "../global.css"

export const Default: Story = () => <LoginForm />
Default.storyName = "Default Login Form"

// export const Loading: Story = () => {
//   const [isLoading, setIsLoading] = useState(true)
//   useEffect(() => {
//     const timer = setTimeout(() => setIsLoading(false), 2000)
//     return () => clearTimeout(timer)
//   }, [])
//   return <LoginForm />
// }
// Loading.storyName = "Loading State"

// export const WithError: Story = () => {
//   const [error, setError] = useState("Invalid email or password")
//   return <LoginForm />
// }
// WithError.storyName = "With Error Message"

// export const WithPrefilledEmail: Story = () => {
//   const [email, setEmail] = useState("user@example.com")
//   return <LoginForm />
// }
// WithPrefilledEmail.storyName = "With Pre-filled Email" 