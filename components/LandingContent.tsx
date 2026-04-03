'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Zap,
  MessageCircle,
  ShoppingBag,
  Clock,
  ArrowRight,
  CheckCircle2,
  Smartphone,
  Globe,
  BarChart3,
  ShieldCheck,
  ZapOff,
  Layout,
  MousePointer2,
  Shirt,
  Home,
  Sparkles,
  Utensils,
  Dumbbell,
  Gamepad2,
  MoreHorizontal,
  Star,
  Users,
  Flame,
  LineChart,
  Heart,
  Link as LinkIcon,
  Store,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Footer from './Footer'

interface LandingContentProps {
  userId: string | null
  stores: any[]
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function LandingContent({ userId, stores }: LandingContentProps) {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans relative overflow-hidden selection:bg-primary/20">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#0066CC_0.02,transparent_0.5)] pointer-events-none opacity-20" />
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/[0.03] rounded-full blur-[120px] pointer-events-none" />
      
      {/* Premium Nav - Apple Luxe Pill */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-8 left-0 right-0 z-50 px-6"
      >
        <div className="mx-auto max-w-5xl h-20 bg-white/60 backdrop-blur-3xl border border-white/40 rounded-full px-8 flex items-center justify-between shadow-2xl shadow-primary/5">
          <Link href="/" className="flex items-center gap-3 active:scale-95 transition-transform cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shadow-lg shadow-primary/10">
              <Zap className="w-5 h-5 text-white fill-primary" />
            </div>
            <span className="font-bold text-xl tracking-tighter">
              Flash<span className="text-primary tracking-tighter">Checkout</span>
            </span>
          </Link>
          <div className="flex items-center gap-8">
            <Link
              href="/explorar"
              className="hidden sm:block text-[13px] font-medium tracking-tight text-zinc-500 hover:text-black transition-colors"
            >
              Marketplace
            </Link>
            {!userId ? (
              <>
                <Link
                  href="/sign-in"
                  className="hidden sm:block text-[13px] font-medium tracking-tight text-zinc-500 hover:text-black transition-colors"
                >
                  Ingresar
                </Link>
                <Link
                  href="/sign-up"
                  className="h-12 bg-primary hover:bg-primary-hover text-white font-bold text-[11px] tracking-widest px-8 flex items-center justify-center transition-all active:scale-95 shadow-xl shadow-primary/20 rounded-full"
                >
                  Comenzar
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard"
                className="h-12 bg-black text-white font-bold text-[11px] tracking-widest px-8 flex items-center justify-center transition-all active:scale-95 shadow-xl shadow-black/10 rounded-full"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-48 pb-20 text-center">
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-10"
        >
          <motion.h1 
            variants={fadeInUp}
            className="text-6xl sm:text-[10rem] font-bold tracking-tight leading-[0.85] text-black max-w-5xl mx-auto"
          >
            Marketplace <br/>
            <span className="text-primary drop-shadow-2xl">Inmersivo.</span>
          </motion.h1>

          <motion.p 
            variants={fadeInUp}
            className="mt-12 text-lg sm:text-2xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-medium tracking-tight opacity-70"
          >
            Diseñamos el checkout más rápido del mundo. <br/>
            Optimizado para la simplicidad y la alta escala.
          </motion.p>

          <motion.div 
            variants={fadeInUp}
            className="mt-20 flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            {!userId ? (
                <Link
                  href="/sign-up"
                  className="w-full sm:w-auto h-24 bg-primary text-white px-20 flex items-center justify-center gap-6 transition-all text-sm font-bold tracking-widest shadow-[0_30px_90px_rgba(255,80,0,0.2)] rounded-full hover:scale-[1.02] active:scale-95"
                >
                  Crear mi tienda
                  <ArrowRight className="w-6 h-6" />
                </Link>
            ) : (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto h-24 bg-black text-white px-20 flex items-center justify-center gap-6 transition-all text-sm font-bold tracking-widest shadow-[0_30px_90px_rgba(0,0,0,0.15)] rounded-full hover:scale-[1.02] active:scale-95"
              >
                Panel de Control
                <ArrowRight className="w-6 h-6" />
              </Link>
            )}
            <a
              href="#explorar"
              className="w-full sm:w-auto h-24 bg-white/70 backdrop-blur-xl border border-black/5 text-zinc-500 hover:text-black px-16 font-bold text-sm tracking-widest flex items-center justify-center gap-4 transition-all rounded-full hover:bg-white active:scale-95 shadow-sm"
            >
              Explorar red
            </a>
          </motion.div>
        </motion.div>

        {/* Storefront Mockup - Apple Luxe Rounded Style */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-48 relative px-4"
        >
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="max-w-xl mx-auto bg-white/70 backdrop-blur-3xl rounded-[3rem] border border-white/50 overflow-hidden shadow-[0_50px_150px_rgba(0,0,0,0.06)] relative z-10"
          >
            <div className="bg-zinc-50/50 backdrop-blur-md px-12 py-10 flex items-center justify-between border-b border-black/[0.03]">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center shadow-lg shadow-primary/10">
                  <Zap className="w-6 h-6 text-primary fill-primary" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-zinc-300 tracking-widest">Tienda verificada</p>
                  <p className="text-xl font-bold text-black tracking-tight">Premium Terminal</p>
                </div>
              </div>
              <div className="flex items-center gap-2 h-8 bg-primary/10 px-4 rounded-full border border-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold text-primary">Flash Sync</span>
              </div>
            </div>
            
            <div className="p-12 space-y-12">
              <div className="space-y-8 text-left">
                <div className="relative aspect-square bg-zinc-50 rounded-[2.5rem] overflow-hidden group border border-black/[0.02] shadow-inner">
                  <div className="absolute top-8 left-8 z-10 bg-white/90 backdrop-blur-sm text-black text-[10px] font-bold px-4 py-2 tracking-widest shadow-xl rounded-full">
                    Nuevo Lanzamiento
                  </div>
                  <div className="w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform duration-1000">
                    <ShoppingBag className="w-32 h-32 text-zinc-100" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-3xl font-bold tracking-tight">Audiófilo Series X</h3>
                    <div className="flex text-amber-300">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="text-5xl font-bold text-black tracking-tighter">$249.900</span>
                    <span className="text-lg text-zinc-300 line-through font-medium tracking-tight opacity-50">$399.000</span>
                  </div>
                </div>
              </div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="h-24 bg-primary text-white flex items-center justify-center gap-5 transition-colors text-sm font-bold tracking-[0.25em] shadow-2xl shadow-primary/30 hover:bg-primary-hover rounded-full cursor-pointer"
              >
                <MessageCircle className="w-6 h-6 fill-white" />
                Pedir por WhatsApp
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Categories Grid Section - Apple Luxe Rounded Style */}
      <section id="categorias" className="relative z-10 py-52 bg-secondary">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-16 mb-32"
          >
            <div className="text-left space-y-6">
              <p className="text-[12px] font-bold text-primary tracking-[0.6em]">Ecosistemas</p>
              <h2 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9]">
                Nichos de <br/> <span className="text-zinc-300">Especialidad.</span>
              </h2>
            </div>
            <p className="text-lg font-medium text-zinc-400 max-w-sm tracking-tight leading-relaxed opacity-60">
              Protocolos optimizados para elevar cualquier vertical comercial a estándares de lujo.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { label: 'Moda & Accesorios', icon: Shirt },
              { label: 'Tecnología', icon: Smartphone },
              { label: 'Hogar & Decoración', icon: Home },
              { label: 'Belleza & Salud', icon: Sparkles },
              { label: 'Comida & Drinks', icon: Utensils },
              { label: 'Deportes', icon: Dumbbell },
              { label: 'Gaming', icon: Gamepad2 },
              { label: 'Otros', icon: MoreHorizontal }
            ].map((cat, i) => (
              <motion.div 
                key={i} 
                variants={fadeInUp}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="bg-white p-12 border border-black/[0.02] hover:shadow-[0_40px_120px_rgba(0,0,0,0.06)] transition-all group relative overflow-hidden rounded-[2.5rem] cursor-pointer"
              >
                <div className="w-16 h-16 rounded-[1.25rem] bg-zinc-50 flex items-center justify-center mb-12 group-hover:bg-primary/5 transition-colors">
                   <cat.icon className="w-7 h-7 text-zinc-300 group-hover:text-primary transition-all group-hover:scale-110" />
                </div>
                <h3 className="font-bold text-base tracking-tight mb-2">{cat.label}</h3>
                <p className="text-[10px] font-bold text-zinc-200 tracking-[0.25em]">Premium Protocol</p>
                <div className="absolute bottom-12 right-12 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <ArrowRight className="w-6 h-6 text-primary" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Philosophy Section - Apple Luxe Rounded Style */}
      <section id="vision" className="relative z-10 py-60 overflow-hidden bg-white">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-100 to-transparent" />
        
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-center mb-48"
          >
            <h2 className="text-7xl sm:text-[9rem] font-bold tracking-tight mb-10">
              Sistema <span className="text-primary tracking-tighter opacity-90">Flash.</span>
            </h2>
            <p className="text-xs font-bold tracking-[0.6em] text-zinc-300">
              Protocolo de conversión de alta frecuencia
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-10 relative"
          >
            <StepCard
              number="01"
              icon={Layout}
              title="Terminal ID"
              description="Despliega tu catálogo optimizado. Una interfaz etérea de alta densidad transaccional."
            />
            <StepCard
              number="02"
              icon={Smartphone}
              title="Broadcast"
              description="Conecta tu link directo. Captura el tráfico de redes sociales y procésalo al instante."
            />
            <StepCard
              number="03"
              icon={Zap}
              title="Escalado"
              description="Recibe pedidos estructurados. Gestiona ventas masivas con simplicidad absoluta."
            />
          </motion.div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="relative z-10 py-40 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-black tracking-tight mb-20"
          >
            Estándares de elite
          </motion.h2>
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <BenefitCard
              icon={Clock}
              title="Velocidad Pura"
              description="Checkout optimizado para cargar en menos de un segundo. Tus clientes no esperan."
            />
            <BenefitCard
              icon={MessageCircle}
              title="WhatsApp Nativo"
              description="Cada pedido llega estructurado. Datos de envío, productos y total listos para facturar."
            />
            <BenefitCard
              icon={ShieldCheck}
              title="Seguridad Total"
              description="Protección de datos bajo protocolos bancarios internacionales. Tu negocio, blindado."
            />
            <BenefitCard
              icon={BarChart3}
              title="Analítica Avanzada"
              description="Dashboard profesional para visualizar tu crecimiento y flujo de caja en tiempo real."
            />
            <BenefitCard
              icon={Smartphone}
              title="Mobile First"
              description="Experiencia de usuario calibrada para dispositivos de alta gama. UI/UX impecable."
            />
            <BenefitCard
              icon={MousePointer2}
              title="Gestión Simple"
              description="Panel administrativo intuitivo. Añade productos y cambia precios en un instante."
            />
          </motion.div>
        </div>
      </section>

      {/* All You Need Section - Apple Luxe Rounded Style */}
      <section className="relative z-10 py-52 bg-zinc-50/50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-32 space-y-8"
          >
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-black max-w-4xl mx-auto leading-tight">
              Todo lo que necesitas <br/> <span className="text-primary opacity-80">en un solo lugar.</span>
            </h2>
            <p className="text-lg font-medium text-zinc-400 max-w-2xl mx-auto tracking-tight opacity-70">
              Hemos condensado el poder de un e-commerce complejo en una interfaz etérea y minimalista.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { 
                title: 'Link Inteligente', 
                desc: 'Un entorno de pago optimizado que procesa pedidos en menos de 30 segundos.',
                icon: LinkIcon 
              },
              { 
                title: 'WhatsApp Sync', 
                desc: 'Notificaciones automáticas y estructuradas para un cierre de venta impecable.',
                icon: MessageCircle 
              },
              { 
                title: 'Terminal Pro', 
                desc: 'Control total de inventario, precios y tiendas desde cualquier dispositivo.',
                icon: LineChart 
              },
              { 
                title: 'Social Ready', 
                desc: 'Diseñado para capturar tráfico masivo desde tus bios de Instagram y TikTok.',
                icon: Heart 
              }
            ].map((feat, i) => (
              <motion.div 
                key={i} 
                variants={fadeInUp}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white p-12 border border-black/[0.02] shadow-[0_30px_90px_rgba(0,0,0,0.04)] hover:shadow-[0_40px_120px_rgba(0,0,0,0.08)] transition-all group rounded-[2.5rem]"
              >
                <div className="w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center mb-10 group-hover:bg-primary group-hover:text-white transition-all">
                  <feat.icon className="w-6 h-6 transition-transform group-hover:scale-110" />
                </div>
                <h3 className="font-bold text-xl tracking-tight mb-4">{feat.title}</h3>
                <p className="text-sm font-medium text-zinc-400 leading-relaxed opacity-80">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Marketplace Section */}
      <section className="relative z-10 py-40 bg-zinc-50/50 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-32 space-y-6"
          >
            <h2 className="text-5xl sm:text-7xl font-bold text-black tracking-tighter leading-none">
              Explora tiendas <span className="text-primary tracking-tighter">Flash.</span>
            </h2>
            <p className="text-[11px] text-primary font-bold tracking-[0.5em]">
              La nueva red comercial de alta gama
            </p>
          </motion.div>

          {stores.length > 0 ? (
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {stores.map((s: any) => (
                <StoreCard key={s.id} store={s} />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-32 bg-white border border-black/[0.03] shadow-sm rounded-none">
              <ShoppingBag className="w-16 h-16 text-zinc-100 mx-auto mb-8" />
              <p className="text-zinc-400 font-bold tracking-tight text-sm opacity-60">
                Aún no hay tiendas registradas en esta zona. <br/>
                Inicia tu legado hoy mismo.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Final Deployment CTA */}
      <section className="relative z-10 py-40 px-6 pb-60">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center space-y-12"
        >
          <h2 className="text-7xl sm:text-[11rem] font-bold tracking-tighter text-black leading-[0.8]">
            Inicia tu <br/> <span className="text-primary glow-text-apple">legado.</span>
          </h2>
          <p className="text-[12px] font-bold tracking-[1em] max-w-sm mx-auto leading-relaxed opacity-40">
            Escalado global habilitado
          </p>
          
          <div className="pt-20">
            {!userId ? (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/sign-up"
                  className="h-32 inline-flex items-center gap-10 bg-black text-white px-28 text-[15px] font-bold tracking-[0.4em] transition-all shadow-[0_40px_120px_rgba(0,0,0,0.25)] rounded-full"
                >
                  Comenzar ahora
                  <Zap className="w-8 h-8 fill-primary text-primary" />
                </Link>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/dashboard"
                  className="h-32 inline-flex items-center gap-10 bg-black text-white px-28 text-[15px] font-bold tracking-[0.4em] transition-all shadow-[0_40px_120px_rgba(0,0,0,0.25)] rounded-full"
                >
                  Panel de Control
                  <Zap className="w-8 h-8 fill-primary text-primary" />
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      {/* Premium Footer */}
      <Footer />
    </div>
  )
}


function StepCard({
  number,
  icon: Icon,
  title,
  description,
}: {
  number: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <motion.div 
      variants={fadeInUp}
      className="text-center group p-14 bg-zinc-50/30 hover:bg-white border border-black/[0.02] hover:shadow-[0_50px_120px_rgba(0,0,0,0.06)] transition-all relative rounded-[2.5rem] overflow-hidden h-full"
    >
      <div className="absolute top-10 right-10">
         <span className="text-5xl font-bold text-zinc-100 group-hover:text-primary/10 transition-colors">{number}</span>
      </div>
      <div className="mb-14 inline-flex items-center justify-center w-24 h-24 rounded-[1.5rem] bg-white group-hover:bg-primary/5 transition-all text-zinc-300 group-hover:text-primary shadow-sm hover:shadow-md">
        <Icon className="w-10 h-10 transition-transform group-hover:scale-110" />
      </div>
      <h3 className="font-bold text-2xl tracking-tight mb-6 text-black">{title}</h3>
      <p className="text-base text-zinc-400 font-medium tracking-tight leading-relaxed max-w-[240px] mx-auto opacity-70">
        {description}
      </p>
    </motion.div>
  )
}

function BenefitCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <motion.div 
      variants={fadeInUp}
      className="bg-white border border-black/[0.02] p-14 hover:shadow-[0_50px_150px_rgba(0,0,0,0.08)] transition-all group relative overflow-hidden text-left h-full flex flex-col rounded-[2.5rem]"
    >
      <div className="w-16 h-16 rounded-[1.25rem] bg-zinc-50 flex items-center justify-center mb-12 group-hover:bg-primary/5 transition-all text-zinc-300 group-hover:text-primary">
        <Icon className="w-8 h-8 transition-transform group-hover:scale-110" />
      </div>
      <h3 className="font-bold text-2xl tracking-tighter mb-4 text-black">{title}</h3>
      <p className="text-base text-zinc-500 font-medium tracking-tight leading-relaxed flex-grow opacity-60">
        {description}
      </p>
      <div className="mt-14 flex items-center gap-4">
        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        <span className="text-[10px] font-bold tracking-[0.4em] text-zinc-300">Flash Core 1.0</span>
      </div>
    </motion.div>
  )
}

function StoreCard({ store }: { store: any }) {
  return (
    <motion.div variants={fadeInUp}>
      <Link 
        href={`/tienda/${store.slug}`}
        className="group bg-white border border-black/[0.03] p-10 hover:shadow-[0_40px_100px_rgba(0,0,0,0.05)] transition-all flex flex-col h-full relative overflow-hidden rounded-[2.5rem]"
      >
        <div className="flex items-center gap-6 mb-10">
          <div className="w-20 h-20 rounded-2xl bg-zinc-50 flex items-center justify-center overflow-hidden border border-black/[0.03] group-hover:scale-105 transition-transform duration-700">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
            ) : (
              <Store className="w-8 h-8 text-zinc-200" />
            )}
          </div>
          <div className="text-left">
            <h3 className="font-bold text-2xl tracking-tighter text-black truncate max-w-[150px]">
              {store.name}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] text-primary font-bold tracking-[0.2em]">Verified</span>
              <div className="w-1 h-1 rounded-none bg-primary/40" />
              <span className="text-[10px] text-zinc-300 font-bold tracking-[0.2em]">Store</span>
            </div>
          </div>
        </div>
        
        <p className="text-base text-zinc-400 font-medium tracking-tight leading-relaxed line-clamp-2 flex-grow mb-12 opacity-80">
          {store.bio || 'Sin descripción comercial oficial.'}
        </p>

        <div className="flex items-center justify-between border-t border-black/[0.03] pt-10 group/link">
          <span className="text-[11px] font-bold tracking-[0.3em] text-zinc-300 group-hover/link:text-primary transition-colors">Ver Terminal</span>
          <div className="w-12 h-12 flex items-center justify-center bg-zinc-50 group-hover/link:bg-black group-hover/link:text-white transition-all text-zinc-300 rounded-full">
            <ArrowRight className="w-5 h-5 transition-transform group-hover/link:translate-x-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
