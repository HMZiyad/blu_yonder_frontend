"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../services/auth.service";

export default function AuthPage() {
  const [currentView, setCurrentView] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Form states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState(""); // store verified code for reset step

  const router = useRouter();

  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirm = () => setShowConfirm(!showConfirm);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const emailValue = formData.get('email') as string;
    const passwordValue = formData.get('password') as string;

    try {
      const response: any = await authService.login({ email: emailValue, password: passwordValue });
      // Backend returns: { token, user: { id, name, email, role } }
      if (response.token) {
        authService.setToken(response.token);
      }
      if (response.user) {
        authService.setUser(response.user);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const emailValue = formData.get('email') as string;
    const passwordValue = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (passwordValue !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // Backend requires: name, email, password
      // Derive name from email prefix
      await authService.register({ name: emailValue.split('@')[0], email: emailValue, password: passwordValue });
      setCurrentView('success');
    } catch (err: any) {
      setError(err.message || "Failed to register");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const emailValue = formData.get('email') as string;
    setEmail(emailValue);

    try {
      // Backend: POST /api/auth/forgot-password { email }
      // Returns: { message: "Reset code generated. Check server logs." }
      await authService.forgotPassword({ email: emailValue });
      setCurrentView('verify');
    } catch (err: any) {
      setError(err.message || "Failed to send reset code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Collect 6 digit code from named inputs
    const formData = new FormData(e.currentTarget);
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += (formData.get(`code_${i}`) as string) || "";
    }

    try {
      // Backend: POST /api/auth/verify-code { email, code }
      await authService.verifyCode({ email, code });
      setVerifyCode(code); // save for password reset step
      setCurrentView('set-password');
    } catch (err: any) {
      setError(err.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const passwordValue = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (passwordValue !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // Backend: POST /api/auth/reset-password { email, code, new_password }
      await authService.resetPassword({ email, code: verifyCode, new_password: passwordValue });
      setCurrentView('password-success');
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const switchView = (view: string) => {
    setError(null);
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen flex justify-center items-center relative overflow-hidden text-white font-sans">
      {/* Background */}
      <div
        className="absolute inset-0 bg-[url('/background_auth/image.png')] bg-cover bg-center -z-10 blur-[4px]"
      />

      <div className="w-full p-5 flex justify-center items-center">
        {/* Glass Panel */}
        <div className="w-full max-w-[521px] bg-white/10 backdrop-blur-[24px] border border-white/20 rounded-xl px-[30px] py-[40px] shadow-[0_10px_32px_rgba(0,0,0,0.2)] min-h-[500px]">

          <div className="flex justify-center mb-6">
            <img src="/logo/logo-aahs-3 1.png" alt="Logo" className="w-[119px] h-[90px] rounded-full object-contain bg-white/10" />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded bg-red-500/20 border border-red-500 text-red-100 text-sm text-center">
              {error}
            </div>
          )}

          {/* VIEW: LOGIN */}
          {currentView === "login" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-medium text-center mb-2 leading-[1.3]">Login to Account</h2>
              <p className="text-[14px] text-white/80 text-center mb-7 leading-[1.5]">Please enter your email and password to continue</p>

              <form className="flex flex-col gap-4" onSubmit={handleLogin}>
                <div className="flex flex-col gap-[6px]">
                  <label className="text-[13px] font-normal text-white/80">Email address</label>
                  <input type="email" name="email" placeholder="esteban_schiller@gmail.com" required
                    className="w-full p-[12px_14px] bg-white/5 border border-white/40 rounded-md text-white text-[14px] outline-none transition-colors focus:border-white/80 placeholder-white/50" />
                </div>

                <div className="flex flex-col gap-[6px]">
                  <label className="text-[13px] font-normal text-white/80">Password</label>
                  <div className="relative flex items-center">
                    <input type={showPassword ? "text" : "password"} name="password" placeholder="*********" required
                      className="w-full p-[12px_14px] pr-10 bg-white/5 border border-white/40 rounded-md text-white text-[14px] outline-none transition-colors focus:border-white/80 placeholder-white/50" />
                    <button type="button" onClick={togglePassword} className="absolute right-3 flex items-center justify-center text-white/60 hover:text-white/90">
                      <i className={showPassword ? "ti ti-eye" : "ti ti-eye-off"} style={{ fontSize: "18px" }}></i>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center -mt-1 mb-1">
                  <label className="flex items-center gap-2 text-[13px] text-white/80 cursor-pointer select-none relative group">
                    <input type="checkbox" className="peer absolute opacity-0 h-0 w-0" />
                    <span className="inline-block w-4 h-4 border border-white/40 rounded-[3px] bg-white/5 relative peer-checked:bg-[#4338ca] peer-checked:border-[#4338ca] after:content-[''] after:absolute after:hidden peer-checked:after:block after:left-1 after:top-[1px] after:w-1 after:h-2 after:border-white after:border-r-2 after:border-b-2 after:rotate-45"></span>
                    Remember Password
                  </label>
                  <button type="button" onClick={() => switchView('forgot')} className="bg-transparent border-none text-[#4338ca] text-[13px] cursor-pointer hover:underline">Forget Password?</button>
                </div>

                <button type="submit" disabled={isLoading} className="w-full p-[14px] bg-[#4338ca] text-white rounded-md text-[15px] font-medium transition-colors hover:bg-[#5046e5] disabled:opacity-50 mt-2">
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>

              <p className="text-center text-[13px] text-white/80 mt-6">
                Don't have any account? <button type="button" onClick={() => switchView('register')} className="bg-transparent border-none text-[#4338ca] text-[13px] cursor-pointer hover:underline">Create an Account</button>
              </p>
            </div>
          )}

          {/* VIEW: REGISTER */}
          {currentView === "register" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-medium text-center mb-2 leading-[1.3]">Create an Account</h2>
              <p className="text-[14px] text-white/80 text-center mb-7 leading-[1.5]">Create your account to identify aircraft</p>

              <form className="flex flex-col gap-4" onSubmit={handleRegister}>
                <div className="flex flex-col gap-[6px]">
                  <label className="text-[13px] font-normal text-white/80">Email address</label>
                  <input type="email" name="email" placeholder="esteban_schiller@gmail.com" required
                    className="w-full p-[12px_14px] bg-white/5 border border-white/40 rounded-md text-white text-[14px] outline-none transition-colors focus:border-white/80 placeholder-white/50" />
                </div>

                <div className="flex flex-col gap-[6px]">
                  <label className="text-[13px] font-normal text-white/80">Password</label>
                  <div className="relative flex items-center">
                    <input type={showPassword ? "text" : "password"} name="password" placeholder="*********" required
                      className="w-full p-[12px_14px] pr-10 bg-white/5 border border-white/40 rounded-md text-white text-[14px] outline-none transition-colors focus:border-white/80 placeholder-white/50" />
                    <button type="button" onClick={togglePassword} className="absolute right-3 flex items-center justify-center text-white/60 hover:text-white/90">
                      <i className={showPassword ? "ti ti-eye" : "ti ti-eye-off"} style={{ fontSize: "18px" }}></i>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-[6px]">
                  <label className="text-[13px] font-normal text-white/80">Confirm Password</label>
                  <div className="relative flex items-center">
                    <input type={showConfirm ? "text" : "password"} name="confirmPassword" placeholder="*********" required
                      className="w-full p-[12px_14px] pr-10 bg-white/5 border border-white/40 rounded-md text-white text-[14px] outline-none transition-colors focus:border-white/80 placeholder-white/50" />
                    <button type="button" onClick={toggleConfirm} className="absolute right-3 flex items-center justify-center text-white/60 hover:text-white/90">
                      <i className={showConfirm ? "ti ti-eye" : "ti ti-eye-off"} style={{ fontSize: "18px" }}></i>
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className="w-full p-[14px] bg-[#4338ca] text-white rounded-md text-[15px] font-medium transition-colors hover:bg-[#5046e5] mt-4 disabled:opacity-50">
                  {isLoading ? 'Signing up...' : 'Sign up'}
                </button>
              </form>

              <p className="text-center text-[13px] text-white/80 mt-6">
                Already have Account? <button type="button" onClick={() => switchView('login')} className="bg-transparent border-none text-white underline text-[13px] cursor-pointer hover:no-underline">Sign in</button>
              </p>
            </div>
          )}

          {/* VIEW: SUCCESS */}
          {currentView === "success" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-medium text-center mb-2 leading-[1.3]">Account Created<br />Successfully!</h2>
              <p className="text-[14px] text-white/80 text-center mb-8 leading-[1.5]">Your account is successfully created! You can sign in<br />now.</p>
              <button type="button" onClick={() => switchView('login')} className="w-full p-[14px] bg-[#4338ca] text-white rounded-md text-[15px] font-medium transition-colors hover:bg-[#5046e5] mt-2">Sign in</button>
            </div>
          )}

          {/* VIEW: FORGOT PASSWORD */}
          {currentView === "forgot" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-medium text-center mb-2 leading-[1.3]">Forget Password?</h2>
              <p className="text-[14px] text-white/80 text-center mb-7 leading-[1.5]">Please enter your email to get verification code</p>

              <form className="flex flex-col gap-4" onSubmit={handleForgotPassword}>
                <div className="flex flex-col gap-[6px]">
                  <label className="text-[13px] font-normal text-white/80">Email address</label>
                  <input type="email" name="email" placeholder="esteban_schiller@gmail.com" required
                    className="w-full p-[12px_14px] bg-white/5 border border-white/40 rounded-md text-white text-[14px] outline-none transition-colors focus:border-white/80 placeholder-white/50" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full p-[14px] bg-[#4338ca] text-white rounded-md text-[15px] font-medium transition-colors hover:bg-[#5046e5] mt-4 disabled:opacity-50">
                  {isLoading ? 'Sending...' : 'Continue'}
                </button>
              </form>
              <p className="text-center text-[13px] text-white/80 mt-4">
                <span className="text-yellow-300 text-[12px]">⚠ Check your server logs for the reset code (email not configured yet)</span>
              </p>
            </div>
          )}

          {/* VIEW: VERIFY */}
          {currentView === "verify" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-medium text-center mb-2 leading-[1.3]">Check your email</h2>
              <p className="text-[14px] text-white/80 text-center mb-6 leading-[1.5]">We sent a code to your email address. Please check your<br />server logs for the 5-digit code.</p>

              <form className="flex flex-col gap-4" onSubmit={handleVerifyCode}>
                <div className="flex gap-2 justify-center">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <input
                      key={i}
                      type="text"
                      name={`code_${i}`}
                      maxLength={1}
                      required
                      className="w-10 h-11 bg-transparent border border-white/40 rounded-md text-center text-white text-base outline-none transition-colors focus:border-white"
                      onChange={(e) => {
                        if (e.target.value.length === 1 && i < 5) {
                          const next = e.target.nextElementSibling as HTMLInputElement;
                          if (next) next.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !(e.target as HTMLInputElement).value && i > 0) {
                          const prev = (e.target as HTMLInputElement).previousElementSibling as HTMLInputElement;
                          if (prev) prev.focus();
                        }
                      }}
                    />
                  ))}
                </div>

                <button type="submit" disabled={isLoading} className="w-full p-[14px] bg-[#4338ca] text-white rounded-md text-[15px] font-medium transition-colors hover:bg-[#5046e5] mt-6 disabled:opacity-50">
                  {isLoading ? 'Verifying...' : 'Verify'}
                </button>
              </form>
            </div>
          )}

          {/* VIEW: SET NEW PASSWORD */}
          {currentView === "set-password" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-medium text-center mb-2 leading-[1.3]">Set a new password</h2>
              <p className="text-[14px] text-white/80 text-center mb-7 leading-[1.5]">Create a new password. Ensure it differs from<br />previous ones for security</p>

              <form className="flex flex-col gap-4" onSubmit={handleResetPassword}>
                <div className="flex flex-col gap-[6px]">
                  <label className="text-[13px] font-normal text-white/80">New Password</label>
                  <div className="relative flex items-center">
                    <input type={showPassword ? "text" : "password"} name="password" placeholder="*********" required
                      className="w-full p-[12px_14px] pr-10 bg-white/5 border border-white/40 rounded-md text-white text-[14px] outline-none transition-colors focus:border-white/80 placeholder-white/50" />
                    <button type="button" onClick={togglePassword} className="absolute right-3 flex items-center justify-center text-white/60 hover:text-white/90">
                      <i className={showPassword ? "ti ti-eye" : "ti ti-eye-off"} style={{ fontSize: "18px" }}></i>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-[6px]">
                  <label className="text-[13px] font-normal text-white/80">Confirm Password</label>
                  <div className="relative flex items-center">
                    <input type={showConfirm ? "text" : "password"} name="confirmPassword" placeholder="*********" required
                      className="w-full p-[12px_14px] pr-10 bg-white/5 border border-white/40 rounded-md text-white text-[14px] outline-none transition-colors focus:border-white/80 placeholder-white/50" />
                    <button type="button" onClick={toggleConfirm} className="absolute right-3 flex items-center justify-center text-white/60 hover:text-white/90">
                      <i className={showConfirm ? "ti ti-eye" : "ti ti-eye-off"} style={{ fontSize: "18px" }}></i>
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className="w-full p-[14px] bg-[#4338ca] text-white rounded-md text-[15px] font-medium transition-colors hover:bg-[#5046e5] mt-4 disabled:opacity-50">
                  {isLoading ? 'Confirming...' : 'Confirm'}
                </button>
              </form>
            </div>
          )}

          {/* VIEW: PASSWORD SUCCESS */}
          {currentView === "password-success" && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-medium text-center mb-2 leading-[1.3]">Password Updated<br />Successfully!</h2>
              <p className="text-[14px] text-white/80 text-center mb-8 leading-[1.5]">Your new password has been saved. You can<br />now continue securely.</p>
              <button type="button" onClick={() => switchView('login')} className="w-full p-[14px] bg-[#4338ca] text-white rounded-md text-[15px] font-medium transition-colors hover:bg-[#5046e5] mt-2">Sign in</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
