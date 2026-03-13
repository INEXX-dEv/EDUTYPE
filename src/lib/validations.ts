import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Geçerli bir email adresi girin'),
  password: z
    .string()
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .regex(/[A-Z]/, 'En az bir büyük harf içermelidir')
    .regex(/[a-z]/, 'En az bir küçük harf içermelidir')
    .regex(/[0-9]/, 'En az bir rakam içermelidir'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  surname: z.string().min(2, 'Soyisim en az 2 karakter olmalıdır'),
  role: z.enum(['STUDENT', 'TEACHER']),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'Kullanım şartlarını kabul etmelisiniz' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('Geçerli bir email adresi girin'),
  password: z.string().min(1, 'Şifre gereklidir'),
});

export const profileSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  surname: z.string().min(2, 'Soyisim en az 2 karakter olmalıdır'),
  tcNumber: z.string().length(11, 'TC Kimlik No 11 haneli olmalıdır').regex(/^\d+$/, 'Sadece rakam içermelidir'),
  school: z.string().min(2, 'Okul adı gereklidir'),
  department: z.string().min(2, 'Bölüm adı gereklidir'),
});

export const contentSchema = z.object({
  title: z.string().min(3, 'Başlık en az 3 karakter olmalıdır'),
  description: z.string().min(10, 'Açıklama en az 10 karakter olmalıdır'),
  categoryId: z.string().optional(),
});

export const examQuestionSchema = z.object({
  question: z.string().min(5, 'Soru en az 5 karakter olmalıdır'),
  options: z
    .array(
      z.object({
        text: z.string().min(1, 'Seçenek boş olamaz'),
        isCorrect: z.boolean(),
      })
    )
    .min(3, 'En az 3 seçenek olmalıdır')
    .max(5, 'En fazla 5 seçenek olabilir')
    .refine((options) => options.filter((o) => o.isCorrect).length === 1, {
      message: 'Tam olarak 1 doğru cevap seçilmelidir',
    }),
});

export const verifyCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'Doğrulama kodu 6 haneli olmalıdır'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Geçerli bir email adresi girin'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'Kod 6 haneli olmalıdır'),
  password: z
    .string()
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .regex(/[A-Z]/, 'En az bir büyük harf içermelidir')
    .regex(/[a-z]/, 'En az bir küçük harf içermelidir')
    .regex(/[0-9]/, 'En az bir rakam içermelidir'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ContentInput = z.infer<typeof contentSchema>;
export type ExamQuestionInput = z.infer<typeof examQuestionSchema>;
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
