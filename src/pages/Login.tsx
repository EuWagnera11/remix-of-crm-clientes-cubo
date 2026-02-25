import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import cuboLogo from '@/assets/cubo-logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWhiteLabel } from '@/contexts/WhiteLabelContext';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { settings } = useWhiteLabel();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'Email ou senha incorretos'
        : error.message);
    } else {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Panel — Branded visual matching CUBO site */}
      <div
        className="relative hidden lg:flex lg:w-[55%] flex-col justify-between overflow-hidden"
        style={{
          background: `linear-gradient(160deg, hsl(24 95% 58%), hsl(24 95% 48%), hsl(20 90% 42%))`,
        }}
      >
        {/* Decorative watermark text — "Refine" style */}
        <span
          className="absolute top-[8%] -left-[3%] text-[12rem] font-serif italic text-white/[0.06] leading-none select-none pointer-events-none"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          Refine
        </span>
        <span
          className="absolute bottom-[5%] -right-[2%] text-[14rem] font-serif italic text-white/[0.05] leading-none select-none pointer-events-none"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          Cubo
        </span>

        {/* Decorative cross shapes */}
        <div className="absolute top-[15%] right-[12%] text-white/[0.08] text-7xl font-light select-none pointer-events-none">+</div>
        <div className="absolute bottom-[25%] left-[8%] text-white/[0.06] text-5xl font-light select-none pointer-events-none">+</div>

        {/* Subtle gradient overlay circles */}
        <div className="absolute -top-[15%] -left-[8%] h-[500px] w-[500px] rounded-full bg-white/[0.05]" />
        <div className="absolute bottom-[5%] right-[-8%] h-[450px] w-[450px] rounded-full bg-white/[0.04]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* No logo/name on left panel */}

          {/* Center message — serif italic like the site */}
          <div className="flex flex-1 flex-col justify-center max-w-lg">
            <h2
              className="text-5xl text-white leading-[1.15] tracking-tight"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              Gerencie sua clínica com{' '}
              <em className="not-italic font-normal" style={{ fontStyle: 'italic' }}>
                inteligência e automação
              </em>
            </h2>
            <p className="mt-6 text-lg text-white/60 leading-relaxed max-w-md">
              Pacientes, agendamentos, orçamentos e financeiro — tudo em um só lugar, no automático.
            </p>

            {/* Stats row */}
            <div className="mt-12 flex items-center gap-10">
              <div>
                <p className="text-3xl font-bold text-white" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>3x</p>
                <p className="text-xs uppercase tracking-[0.15em] text-white/40 mt-1">mais agendamentos</p>
              </div>
              <div className="h-10 w-px bg-white/15" />
              <div>
                <p className="text-3xl font-bold text-white" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>24h</p>
                <p className="text-xs uppercase tracking-[0.15em] text-white/40 mt-1">atendimento IA</p>
              </div>
              <div className="h-10 w-px bg-white/15" />
              <div>
                <p className="text-3xl font-bold text-white" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>+200</p>
                <p className="text-xs uppercase tracking-[0.15em] text-white/40 mt-1">clínicas</p>
              </div>
            </div>
          </div>

          {/* Bottom tagline */}
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/25 font-medium">
            Estrutura / Velocidade / Lucro
          </p>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="relative flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
        {/* Logo top-right */}
        <img src={cuboLogo} alt="CUBO" className="absolute top-6 right-6 h-10 hidden lg:block" />
        <div className="w-full max-w-[400px] space-y-8">
          {/* Mobile-only brand */}
          <div className="flex flex-col items-center gap-4 lg:hidden">
            <div className={cn(
              "flex h-16 w-16 items-center justify-center rounded-2xl overflow-hidden",
              settings.logoUrl ? "" : "bg-primary"
            )}>
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-primary-foreground">{settings.clinicName.charAt(0)}</span>
              )}
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight">{settings.clinicName}</h1>
              <p className="text-sm text-muted-foreground">{settings.clinicSubtitle}</p>
            </div>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Bem-vindo de volta</h1>
            <p className="text-muted-foreground">Entre com suas credenciais para acessar o painel.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={cn(
                  "h-12 rounded-xl border-border/50 bg-muted/20 px-4 text-sm transition-all duration-200 focus-visible:ring-primary/20",
                  focused === 'email' && "border-primary/40 shadow-sm"
                )}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className={cn(
                    "h-12 rounded-xl border-border/50 bg-muted/20 px-4 pr-12 text-sm transition-all duration-200 focus-visible:ring-primary/20",
                    focused === 'password' && "border-primary/40 shadow-sm"
                  )}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3">
                <p className="text-sm text-destructive font-medium">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-xl gap-2 text-sm font-semibold shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  Entrando...
                </span>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border/50" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/40">cubo crm</span>
            <div className="h-px flex-1 bg-border/50" />
          </div>

          {/* Footer */}
          <p className="text-center text-[11px] text-muted-foreground/30 lg:hidden">
            Estrutura / Velocidade / Lucro
          </p>
        </div>
      </div>
    </div>
  );
}