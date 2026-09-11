import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { login as loginApi, logout as logoutApi, LoginDto } from '@/api/auth';
import { useAuthStore } from '@/stores/auth';

export function useLogin() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (dto: LoginDto) => loginApi(dto),
    onSuccess: (data) => {
      setUser(data.user);
      router.replace('/dashboard');
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const clear = useAuthStore((s) => s.clear);

  return useMutation({
    mutationFn: () => logoutApi(),
    onSettled: () => {
      clear();
      router.replace('/login');
    },
  });
}
