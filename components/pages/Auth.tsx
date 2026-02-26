'use client'

import type { Session, User } from '@supabase/supabase-js'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Logo } from '@/components/ui/Logo'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { showError, showSuccess } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

const Auth = () => {
	const [user, setUser] = useState<User | null>(null)
	const [session, setSession] = useState<Session | null>(null)
	const [loading, setLoading] = useState(false)
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [fullName, setFullName] = useState('')
	const router = useRouter()
	// Using enhanced toast helpers

	useEffect(() => {
		// Check for existing session on component mount
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session)
			setUser(session?.user ?? null)

			// Let AuthContext handle redirects - no redirect logic here
		})

		// Set up auth state listener without redirect logic
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			setSession(session)
			setUser(session?.user ?? null)
			// Let AuthContext handle redirects
		})

		return () => subscription.unsubscribe()
	}, [router])

	const handleSignUp = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)

		try {
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						full_name: fullName,
					},
				},
			})

			if (error) {
				showError('Sign up failed', error.message)
			} else if (data.user) {
				showSuccess(
					'Success!',
					'Please check your email to confirm your account.',
				)
				router.push('/dashboard')
			}
		} catch (error) {
			showError('Sign up failed', 'An unexpected error occurred')
		} finally {
			setLoading(false)
		}
	}

	const handleSignIn = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)

		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			})

			if (error) {
				showError('Sign in failed', error.message)
			} else if (data.user) {
				showSuccess(
					'Welcome back!',
					'You have been successfully signed in.',
				)
				// Redirect to dashboard after successful sign in
				router.push('/dashboard')
			}
		} catch (error) {
			showError('Sign in failed', 'An unexpected error occurred')
		} finally {
			setLoading(false)
		}
	}

	const handleGoogleSignIn = async () => {
		setLoading(true)

		try {
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo: `${window.location.origin}/dashboard`,
				},
			})

			if (error) {
				showError('Google sign in failed', error.message)
				setLoading(false)
			}
			// Note: Don't set loading to false here as the user will be redirected
		} catch (error) {
			showError('Google sign in failed', 'An unexpected error occurred')
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-primary/5 flex items-center justify-center p-4">
			<div className="w-full max-w-md space-y-4">
				<div className="text-center space-y-2">
					<Link
						className="inline-flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
						href="/"
					>
						<ArrowLeft className="h-4 w-4" />
						<span>Back to home</span>
					</Link>
					<div className="flex justify-center">
						<Logo className="text-3xl" size="xl" />
					</div>
					{/* <p className="text-muted-foreground">Create your account or sign in to continue</p> */}
				</div>

				<Card className="bg-card border-border shadow-xl">
					<CardHeader>
						<CardTitle className="text-foreground">
							Welcome
						</CardTitle>
						<CardDescription className="text-muted-foreground">
							Choose your preferred method to get started
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Tabs className="space-y-4" defaultValue="signin">
							<TabsList className="grid w-full grid-cols-2 bg-muted">
								<TabsTrigger
									className="text-muted-foreground data-[state=active]:text-foreground"
									value="signin"
								>
									Sign In
								</TabsTrigger>
								<TabsTrigger
									className="text-muted-foreground data-[state=active]:text-foreground"
									value="signup"
								>
									Sign Up
								</TabsTrigger>
							</TabsList>

							<TabsContent className="space-y-4" value="signin">
								<div className="space-y-4">
									<Button
										className="w-full border-input hover:bg-accent hover:text-accent-foreground font-medium"
										disabled={loading}
										onClick={handleGoogleSignIn}
										variant="outline"
									>
										<svg
											className="w-4 h-4 mr-2"
											viewBox="0 0 24 24"
										>
											<path
												d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
												fill="#4285F4"
											/>
											<path
												d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
												fill="#34A853"
											/>
											<path
												d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
												fill="#FBBC05"
											/>
											<path
												d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
												fill="#EA4335"
											/>
										</svg>
										{loading
											? 'Signing in...'
											: 'Continue with Google'}
									</Button>

									<div className="relative">
										<div className="absolute inset-0 flex items-center">
											<Separator className="w-full" />
										</div>
										<div className="relative flex justify-center text-xs uppercase">
											<span className="bg-background px-2 text-muted-foreground">
												Or continue with email
											</span>
										</div>
									</div>

									<form
										className="space-y-4"
										onSubmit={handleSignIn}
									>
										<div className="space-y-2">
											<Label
												className="text-foreground"
												htmlFor="signin-email"
											>
												Email
											</Label>
											<Input
												className="bg-background border-input text-foreground placeholder:text-muted-foreground"
												id="signin-email"
												onChange={(e) =>
													setEmail(e.target.value)
												}
												placeholder="Enter your email"
												required
												type="email"
												value={email}
											/>
										</div>
										<div className="space-y-2">
											<Label
												className="text-foreground"
												htmlFor="signin-password"
											>
												Password
											</Label>
											<Input
												className="bg-background border-input text-foreground placeholder:text-muted-foreground"
												id="signin-password"
												onChange={(e) =>
													setPassword(e.target.value)
												}
												placeholder="Enter your password"
												required
												type="password"
												value={password}
											/>
										</div>
										<Button
											className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
											disabled={loading}
											type="submit"
										>
											{loading
												? 'Signing in...'
												: 'Sign In'}
										</Button>
									</form>
								</div>
							</TabsContent>

							<TabsContent className="space-y-4" value="signup">
								<div className="space-y-4">
									<Button
										className="w-full border-input hover:bg-accent hover:text-accent-foreground font-medium"
										disabled={loading}
										onClick={handleGoogleSignIn}
										variant="outline"
									>
										<svg
											className="w-4 h-4 mr-2"
											viewBox="0 0 24 24"
										>
											<path
												d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
												fill="#4285F4"
											/>
											<path
												d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
												fill="#34A853"
											/>
											<path
												d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
												fill="#FBBC05"
											/>
											<path
												d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
												fill="#EA4335"
											/>
										</svg>
										{loading
											? 'Signing up...'
											: 'Continue with Google'}
									</Button>

									<div className="relative">
										<div className="absolute inset-0 flex items-center">
											<Separator className="w-full" />
										</div>
										<div className="relative flex justify-center text-xs uppercase">
											<span className="bg-background px-2 text-muted-foreground">
												Or continue with email
											</span>
										</div>
									</div>

									<form
										className="space-y-4"
										onSubmit={handleSignUp}
									>
										<div className="space-y-2">
											<Label
												className="text-foreground"
												htmlFor="signup-name"
											>
												Full Name
											</Label>
											<Input
												className="bg-background border-input text-foreground placeholder:text-muted-foreground"
												id="signup-name"
												onChange={(e) =>
													setFullName(e.target.value)
												}
												placeholder="Enter your full name"
												required
												type="text"
												value={fullName}
											/>
										</div>
										<div className="space-y-2">
											<Label
												className="text-foreground"
												htmlFor="signup-email"
											>
												Email
											</Label>
											<Input
												className="bg-background border-input text-foreground placeholder:text-muted-foreground"
												id="signup-email"
												onChange={(e) =>
													setEmail(e.target.value)
												}
												placeholder="Enter your email"
												required
												type="email"
												value={email}
											/>
										</div>
										<div className="space-y-2">
											<Label
												className="text-foreground"
												htmlFor="signup-password"
											>
												Password
											</Label>
											<Input
												className="bg-background border-input text-foreground placeholder:text-muted-foreground"
												id="signup-password"
												onChange={(e) =>
													setPassword(e.target.value)
												}
												placeholder="Create a password"
												required
												type="password"
												value={password}
											/>
										</div>
										<Button
											className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
											disabled={loading}
											type="submit"
										>
											{loading
												? 'Creating account...'
												: 'Create Account'}
										</Button>
									</form>
								</div>
							</TabsContent>
						</Tabs>
					</CardContent>
				</Card>

				<div className="text-center text-sm text-muted-foreground">
					By continuing, you agree to our Terms of Service and Privacy
					Policy
				</div>
			</div>
		</div>
	)
}

export default Auth
