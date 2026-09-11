import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/auth';

export default function Index() {
  const user = useAuthStore((s) => s.user);
  return user ? <Redirect href="/dashboard" /> : <Redirect href="/login" />;
}
