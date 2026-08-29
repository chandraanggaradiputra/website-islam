'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { login } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Lock, User, AlertCircle, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMsg('');
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);
    
    const res = await login(formData);
    
    if (res.success && res.redirect) {
      router.push(res.redirect);
    } else if (res.error) {
      setErrorMsg(res.error);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Login Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400">Silakan masuk dengan akun Admin atau DKM.</p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <p className="text-sm">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              {...register('username')}
              className={`block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border ${errors.username ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 dark:border-slate-800 focus:ring-[#093c96]'} rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2`}
              placeholder="Masukkan username"
            />
          </div>
          {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="password"
              {...register('password')}
              className={`block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border ${errors.password ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 dark:border-slate-800 focus:ring-[#093c96]'} rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2`}
              placeholder="Masukkan password"
            />
          </div>
          {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-6 flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#093c96] hover:bg-[#072a6b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#093c96] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Masuk'}
        </button>
      </form>
    </div>
  );
}
