import { AuthLayout } from '@/components/auth/AuthLayout'
import { LoginForm } from '@/components/auth/LoginForm'

export function Login() {
  return (
    <AuthLayout type="login">
      <LoginForm />
    </AuthLayout>
  )
}
