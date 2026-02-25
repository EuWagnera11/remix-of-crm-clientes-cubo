import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWhiteLabel } from '@/contexts/WhiteLabelContext';
import { LogIn, Eye, EyeOff, ArrowRight } from 'lucide-react';
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
      {/* Left Panel — Visual / Branding */}
      <div
        className="relative hidden lg:flex lg:w-[55%] flex-col justify-between overflow-hidden"
        style={{ background: `linear-gradient(135deg, hsl(${settings.primaryColor}), hsl(${settings.primaryColor} / 0.8))` }}
      >
        {/* Decorative shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] h-[600px] w-[600px] rounded-full opacity-10 bg-white" />
          <div className="absolute bottom-[10%] right-[-5%] h-[400px] w-[400px] rounded-full opacity-10 bg-white" />
          <div className="absolute top-[40%] left-[30%] h-[200px] w-[200px] rounded-full opacity-5 bg-white" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo top */}
          <div className="flex items-center gap-3">
            <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl overflow-hidden", settings.logoUrl ? "bg-white/20 backdrop-blur-sm" : "bg-white/20")}>
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-white">{settings.clinicName.charAt(0)}</span>
              )}
            </div>
            <div>
              <span className="text-lg font-semibold text-white">{settings.clinicName}</span>
              <span className="ml-2 text-sm text-white/60">{settings.clinicSubtitle}</span>
            </div>
          </div>

          {/* Center message */}
          <div className="flex flex-1 flex-col justify-center max-w-md">
            <h2 className="text-4xl font-bold text-white leading-tight tracking-tight">
              Gerencie sua clínica com{' '}
              <span className="text-white/90">inteligência</span>
            </h2>
            <p className="mt-4 text-lg text-white/70 leading-relaxed">
              Pacientes, agendamentos, orçamentos e financeiro — tudo em um só lugar.
            </p>

            {/* Feature pills */}
            <div className="mt-10 flex flex-wrap gap-3">
              {['Pipeline de Pacientes', 'Financeiro', 'Automações', 'WhatsApp', 'NPS'].map((feat) => (
                <span
                  key={feat}
                  className="rounded-full bg-white/15 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white/90 border border-white/10"
                >
                  {feat}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom tagline */}
          <p className="relative z-10 text-xs uppercase tracking-[0.25em] text-white/30 font-medium">
            Estrutura / Velocidade / Lucro
          </p>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-[380px] space-y-8">
          {/* Mobile-only brand */}
          <div className="flex flex-col items-center gap-3 lg:hidden">
            <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl overflow-hidden", settings.logoUrl ? "" : "bg-primary")}>
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-primary-foreground">{settings.clinicName.charAt(0)}</span>
              )}
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight">{settings.clinicName}</h1>
              <p className="text-sm text-muted-foreground">{settings.clinicSubtitle}</p>
            </div>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Bem-vindo de volta</h1>
            <p className="text-muted-foreground text-sm">Entre com suas credenciais para acessar o painel.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={cn(
                  "h-12 rounded-xl border-border/60 bg-muted/30 px-4 text-sm transition-all duration-200",
                  focused === 'email' && "ring-2 ring-primary/20 border-primary/40"
                )}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Senha</Label>
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
                    "h-12 rounded-xl border-border/60 bg-muted/30 px-4 pr-12 text-sm transition-all duration-200",
                    focused === 'password' && "ring-2 ring-primary/20 border-primary/40"
                  )}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
                <p className="text-sm text-destructive font-medium">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-xl gap-2 text-sm font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
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

          {/* Footer */}
          <p className="text-center text-[11px] text-muted-foreground/40 lg:hidden">
            Estrutura / Velocidade / Lucro
          </p>
        </div>
      </div>
    </div>
  );
}