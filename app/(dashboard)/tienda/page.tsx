"use client"

import { useState } from 'react'
import { cn } from "@/lib/utils"
import { 
  Store, 
  Upload, 
  Trash2, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Globe, 
  Check, 
  Copy, 
  ExternalLink, 
  Power, 
  Search, 
  ShoppingCart, 
  ChevronRight, 
  Truck, 
  Shield, 
  Award, 
  Clock, 
  FileText, 
  ChevronDown, 
  Maximize2 
} from 'lucide-react'

// Mock categories for live preview
const mockCategories = ["Granos", "Moliendas", "Accesorios", "Ediciones Especiales"]

// Mock products for live preview
const mockProducts = [
  { name: "Café Origen Supremo (500g)", price: "$42,000 COP", img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop" },
  { name: "Café Moka Especial (250g)", price: "$28,000 COP", img: "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=300&auto=format&fit=crop" },
]

export default function TiendaDashboardPage() {
  // Navigation Tabs state
  const [activeTab, setActiveTab] = useState<'apariencia' | 'info' | 'dominios' | 'seo' | 'redes' | 'politicas'>('apariencia')
  
  // Device Preview selection
  const [device, setDevice] = useState<'escritorio' | 'tablet' | 'movil'>('escritorio')

  // Color Theme state
  const [colors, setColors] = useState({
    primario: '#6F42C1',
    secundario: '#FF7A00',
    acento: '#22C55E',
    fondo: '#F8FAFC',
    texto: '#1F2937'
  })

  // Visible sections toggles
  const [sections, setSections] = useState({
    banner: true,
    destacados: true,
    categorias: true,
    beneficios: true,
    testimonios: true,
    newsletter: true
  })

  // Logo & Banner State
  const [logoUrl, setLogoUrl] = useState<string | null>("☕ CAFÉ DEL VALLE")
  const [bannerUrl, setBannerUrl] = useState<string>("https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=800&auto=format&fit=crop")
  
  // Typography State
  const [typography, setTypography] = useState('font-sans')

  // Copied link state
  const [copied, setCopied] = useState(false)

  // Store status state
  const [storeActive, setStoreActive] = useState(true)

  // Settings states for other tabs
  const [storeInfo, setStoreInfo] = useState({
    name: 'Café del Valle',
    desc: 'Café de especialidad cultivado y tostado en el corazón de Colombia.',
    whatsapp: '573001234567',
    address: 'Calle 10 # 43 - 21, Medellín, Colombia'
  })
  const [domains, setDomains] = useState({
    subdomain: 'cafe-del-valle',
    customDomain: 'cafedelvalle.co'
  })
  const [seo, setSeo] = useState({
    title: 'Café del Valle | Café de Especialidad',
    desc: 'Compra café colombiano de la más alta calidad y recíbelo fresco en tu puerta.'
  })

  const copyStoreUrl = () => {
    navigator.clipboard.writeText(`https://${domains.subdomain}.flashcheckout.co`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Handle color change from color picker
  const handleColorChange = (key: keyof typeof colors, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6 pb-6 animate-in duration-300">
      
      {/* Title & Tabs */}
      <div className="space-y-4 text-left">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Tienda</h1>
          <p className="text-xs xl:text-sm font-semibold text-zinc-400 mt-0.5">
            Personaliza la apariencia y configuración de tu tienda online
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-zinc-200 overflow-x-auto scrollbar-none whitespace-nowrap gap-6">
          {[
            { id: 'apariencia', label: 'Apariencia' },
            { id: 'info', label: 'Información de la tienda' },
            { id: 'dominios', label: 'Dominios' },
            { id: 'seo', label: 'SEO' },
            { id: 'redes', label: 'Redes sociales' },
            { id: 'politicas', label: 'Políticas' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-xs xl:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id 
                  ? 'border-emerald-500 text-emerald-800' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* RENDER APARIENCIA TAB */}
      {activeTab === 'apariencia' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
          
          {/* LEFT COLUMN: Controls (5/12) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            
            {/* Logo de la tienda */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
              <div>
                <h3 className="text-xs xl:text-sm font-extrabold text-zinc-800 uppercase tracking-wider">Logo de la tienda</h3>
                <p className="text-[11px] font-semibold text-zinc-400 mt-1">Este logo se mostrará en tu tienda online y enlaces de pago.</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-center font-extrabold text-zinc-700 text-xs overflow-hidden select-none p-2 border-dashed">
                  {logoUrl ? logoUrl : "Sin logo"}
                </div>
                <div className="flex gap-2">
                  <label className="px-3.5 py-2 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100/50 text-zinc-700 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-all select-none">
                    <Upload className="w-3.5 h-3.5" />
                    Cambiar logo
                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) setLogoUrl(URL.createObjectURL(file))
                    }} />
                  </label>
                  {logoUrl && (
                    <button 
                      onClick={() => setLogoUrl(null)}
                      className="p-2 border border-red-100 hover:bg-red-50 text-red-500 rounded-lg transition-all cursor-pointer"
                      title="Eliminar logo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Banner principal */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
              <div>
                <h3 className="text-xs xl:text-sm font-extrabold text-zinc-800 uppercase tracking-wider">Banner principal</h3>
                <p className="text-[11px] font-semibold text-zinc-400 mt-1">Imagen destacada que verán tus clientes en la portada.</p>
              </div>

              <div className="space-y-3">
                <div className="h-28 w-full bg-zinc-100 rounded-lg overflow-hidden border border-zinc-200 relative select-none">
                  {bannerUrl ? (
                    <img src={bannerUrl} alt="Store Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                      <Store className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <label className="px-3.5 py-2 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100/50 text-zinc-700 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-all select-none">
                    <Upload className="w-3.5 h-3.5" />
                    Cambiar banner
                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) setBannerUrl(URL.createObjectURL(file))
                    }} />
                  </label>
                  <button 
                    onClick={() => setBannerUrl("")}
                    className="p-2 border border-red-100 hover:bg-red-50 text-red-500 rounded-lg transition-all cursor-pointer"
                    title="Eliminar banner"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Colores del tema */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
              <div>
                <h3 className="text-xs xl:text-sm font-extrabold text-zinc-800 uppercase tracking-wider">Colores del tema</h3>
                <p className="text-[11px] font-semibold text-zinc-400 mt-1">Personaliza los colores principales de tu tienda.</p>
              </div>

              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-5">
                {[
                  { key: 'primario', label: 'Primario' },
                  { key: 'secundario', label: 'Secundario' },
                  { key: 'acento', label: 'Acento' },
                  { key: 'fondo', label: 'Fondo' },
                  { key: 'texto', label: 'Texto' }
                ].map(item => (
                  <div key={item.key} className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-405 block uppercase tracking-wider leading-none">{item.label}</span>
                    <div className="flex items-center gap-1.5 mt-1 border border-zinc-100 rounded-lg p-1.5 bg-zinc-50/50 relative overflow-hidden">
                      <input 
                        type="color" 
                        value={colors[item.key as keyof typeof colors]}
                        onChange={e => handleColorChange(item.key as keyof typeof colors, e.target.value)}
                        className="w-6 h-6 rounded-md border border-zinc-200/50 cursor-pointer overflow-hidden opacity-100 shrink-0" 
                      />
                      <span className="text-[9px] font-black uppercase tracking-tighter text-zinc-700 truncate w-full select-all">
                        {colors[item.key as keyof typeof colors]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tipografía */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
              <div>
                <h3 className="text-xs xl:text-sm font-extrabold text-zinc-800 uppercase tracking-wider">Tipografía</h3>
                <p className="text-[11px] font-semibold text-zinc-400 mt-1">Selecciona la tipografía de tu tienda.</p>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select 
                    value={typography}
                    onChange={e => setTypography(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 text-xs xl:text-sm font-semibold text-zinc-800 focus:outline-none focus:border-zinc-950 appearance-none cursor-pointer"
                  >
                    <option value="font-sans">Inter (Sans-serif)</option>
                    <option value="font-serif">Playfair Display (Serif)</option>
                    <option value="font-mono">Geist Mono (Monospace)</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Device Live Preview & Visibility Switches (7/12) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Live Preview Monitor */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 flex flex-col items-center">
              <div className="flex items-center justify-between w-full border-b border-zinc-100 pb-3">
                <h3 className="text-xs xl:text-sm font-extrabold text-zinc-850 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-zinc-555" />
                  Vista previa de tu tienda
                </h3>
                
                {/* Device switches */}
                <div className="flex items-center border border-zinc-200 rounded-lg p-0.5 bg-zinc-50/50">
                  {[
                    { id: 'escritorio', icon: Monitor, label: 'Escritorio' },
                    { id: 'tablet', icon: Tablet, label: 'Tablet' },
                    { id: 'movil', icon: Smartphone, label: 'Móvil' }
                  ].map(dev => {
                    const Icon = dev.icon
                    return (
                      <button
                        key={dev.id}
                        onClick={() => setDevice(dev.id as any)}
                        className={`p-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1 text-[10px] xl:text-xs font-bold ${
                          device === dev.id 
                            ? 'bg-white text-zinc-955 shadow-sm border border-zinc-200/40' 
                            : 'text-zinc-400 hover:text-zinc-700'
                        }`}
                        title={dev.label}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{dev.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* LIVE CANVAS MOCKUP FRAME */}
              <div className="w-full flex justify-center py-6 bg-zinc-50 border border-zinc-150 border-dashed rounded-xl overflow-hidden min-h-[460px] relative items-start">
                <div 
                  className={cn(
                    "bg-white shadow-xl transition-all duration-300 border border-zinc-200 flex flex-col text-left overflow-y-auto select-none rounded-xl",
                    device === 'escritorio' ? 'w-full max-w-[620px] h-[400px]' : '',
                    device === 'tablet' ? 'w-[420px] h-[420px]' : '',
                    device === 'movil' ? 'w-[280px] h-[420px] rounded-[32px] border-8 border-zinc-900 shadow-2xl relative' : ''
                  )}
                  style={{ fontFamily: typography === 'font-sans' ? 'Inter, sans-serif' : typography === 'font-serif' ? 'Georgia, serif' : 'monospace', backgroundColor: colors.fondo }}
                >
                  {/* Phone Header notch for Mobile view */}
                  {device === 'movil' && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-zinc-900 h-4 w-28 rounded-b-xl z-20 flex items-center justify-center">
                      <div className="w-2 h-2 bg-zinc-800 rounded-full" />
                    </div>
                  )}

                  {/* Navbar preview */}
                  <header className="flex justify-between items-center py-2 px-3 xl:px-4 border-b bg-white sticky top-0 z-10" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                    <span className="text-xs xl:text-sm font-black tracking-tight" style={{ color: colors.texto }}>
                      {logoUrl || "CAFÉ DEL VALLE"}
                    </span>
                    <div className="flex items-center gap-2.5">
                      <Search className="w-3.5 h-3.5 text-zinc-400" />
                      <div className="relative">
                        <ShoppingCart className="w-3.5 h-3.5 text-zinc-700" />
                        <span className="absolute -top-1.5 -right-1.5 w-3 h-3 text-[7px] font-black text-white rounded-full flex items-center justify-center" style={{ backgroundColor: colors.primario }}>
                          2
                        </span>
                      </div>
                    </div>
                  </header>

                  {/* Body Scrollable Area */}
                  <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    
                    {/* Banner Section */}
                    {sections.banner && bannerUrl && (
                      <div className="relative h-28 xl:h-36 w-full flex items-center justify-center overflow-hidden">
                        <img src={bannerUrl} alt="Store Cover" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 z-0" />
                        
                        <div className="relative z-10 px-4 text-center space-y-1.5">
                          <h4 className="text-xs xl:text-sm font-black text-white tracking-tight">El mejor café, directo a tu puerta</h4>
                          <p className="text-[8px] xl:text-[9px] text-zinc-300 font-semibold max-w-[200px] mx-auto leading-tight">Descubre nuestros granos de especialidad</p>
                          <button className="px-2.5 py-1 text-[8px] xl:text-[9px] font-bold text-white rounded transition-transform scale-100 hover:scale-102" style={{ backgroundColor: colors.primario }}>
                            Ver productos
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Categories Badges */}
                    {sections.categorias && (
                      <div className="p-3 border-b border-zinc-50" style={{ backgroundColor: colors.fondo }}>
                        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                          {mockCategories.map((c, idx) => (
                            <span 
                              key={idx} 
                              className="px-2 py-0.5 rounded-full text-[8px] font-extrabold shrink-0 border transition-all"
                              style={{ 
                                backgroundColor: idx === 0 ? colors.primario : 'white', 
                                color: idx === 0 ? 'white' : colors.texto,
                                borderColor: idx === 0 ? colors.primario : '#E4E4E7'
                              }}
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Featured Products */}
                    {sections.destacados && (
                      <div className="p-3 space-y-2">
                        <span className="text-[8px] xl:text-[9px] font-black uppercase tracking-wider" style={{ color: colors.texto }}>Productos destacados</span>
                        <div className="grid grid-cols-2 gap-2">
                          {mockProducts.map((p, idx) => (
                            <div key={idx} className="bg-white rounded-lg border border-zinc-150 overflow-hidden flex flex-col justify-between p-1.5 hover:shadow-sm transition-all">
                              <img src={p.img} alt={p.name} className="h-16 w-full object-cover rounded-md" />
                              <div className="mt-1 space-y-0.5 text-left">
                                <h5 className="text-[8px] font-black leading-tight text-zinc-800 truncate">{p.name}</h5>
                                <div className="flex justify-between items-center mt-1">
                                  <span className="text-[8px] font-black text-zinc-900">{p.price}</span>
                                  <button className="w-4 h-4 rounded flex items-center justify-center text-white font-bold text-[10px]" style={{ backgroundColor: colors.primario }}>
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Visible Benefits */}
                    {sections.beneficios && (
                      <div className="p-3 bg-zinc-50/60 border-t border-b border-zinc-100/60 grid grid-cols-2 gap-2" style={{ backgroundColor: colors.fondo }}>
                        {[
                          { title: 'Envíos rápidos', desc: 'A todo el país', icon: Truck },
                          { title: 'Pagos seguros', desc: 'Múltiples métodos', icon: Shield },
                          { title: 'Café de calidad', desc: 'Granos selectos', icon: Award },
                          { title: 'Atención 24/7', desc: 'Siempre disponible', icon: Clock }
                        ].map((b, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-left">
                            <b.icon className="w-3.5 h-3.5" style={{ color: colors.secundario }} />
                            <div>
                              <h6 className="text-[7.5px] font-black leading-none text-zinc-800">{b.title}</h6>
                              <span className="text-[6.5px] font-semibold text-zinc-400 mt-0.5 block">{b.desc}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Testimonials */}
                    {sections.testimonios && (
                      <div className="p-3 space-y-1.5 text-center">
                        <span className="text-[8px] xl:text-[9px] font-black uppercase tracking-wider block" style={{ color: colors.texto }}>Clientes felices</span>
                        <div className="bg-white border border-zinc-100 rounded-lg p-2 text-[7.5px] font-medium text-zinc-500 italic max-w-[200px] mx-auto">
                          "El mejor café que he probado en años. Envío súper rápido y muy fresco. ¡Recomendado 100%!"
                          <span className="block font-black text-zinc-850 not-italic mt-1 text-[7px]">— Camila R.</span>
                        </div>
                      </div>
                    )}

                    {/* Newsletter Subscription */}
                    {sections.newsletter && (
                      <div className="p-3 bg-zinc-900 text-center space-y-1.5 text-white">
                        <h6 className="text-[8px] font-black tracking-tight leading-none">Únete a nuestra lista de correo</h6>
                        <p className="text-[6.5px] text-zinc-400 font-semibold leading-none">Recibe promociones y recetas exclusivas</p>
                        <div className="flex gap-1 max-w-[180px] mx-auto mt-1">
                          <input type="text" placeholder="Tu correo" disabled className="bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 text-[7px] flex-grow text-white outline-none min-w-0" />
                          <button className="px-2 py-0.5 rounded text-[7px] font-black text-white shrink-0" style={{ backgroundColor: colors.primario }}>
                            Unirse
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            </div>

            {/* Config & Toggles Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Visible Sections toggles */}
              <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 text-left">
                <div>
                  <h3 className="text-xs xl:text-sm font-extrabold text-zinc-855 uppercase tracking-wider">Secciones visibles</h3>
                  <p className="text-[11px] font-semibold text-zinc-400 mt-1">Activa o desactiva las secciones que deseas mostrar en tu tienda.</p>
                </div>

                <div className="space-y-2">
                  {[
                    { key: 'banner', label: 'Banner principal' },
                    { key: 'destacados', label: 'Productos destacados' },
                    { key: 'categorias', label: 'Categorías' },
                    { key: 'beneficios', label: 'Beneficios' },
                    { key: 'testimonios', label: 'Testimonios' },
                    { key: 'newsletter', label: 'Newsletter' }
                  ].map(sec => (
                    <button
                      key={sec.key}
                      onClick={() => setSections(prev => ({ ...prev, [sec.key]: !prev[sec.key as keyof typeof sections] }))}
                      className="flex items-center justify-between w-full p-2 hover:bg-zinc-50 rounded-lg transition-all text-xs font-semibold text-zinc-700 cursor-pointer select-none"
                    >
                      <span>{sec.label}</span>
                      <div className={`w-9 h-5 rounded-full flex items-center p-0.5 transition-all duration-300 ${
                        sections[sec.key as keyof typeof sections] ? 'bg-emerald-500 justify-end' : 'bg-zinc-200 justify-start'
                      }`}>
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action info: Link & Store state */}
              <div className="space-y-6 text-left">
                
                {/* Enlace de tu tienda */}
                <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
                  <div>
                    <h3 className="text-xs xl:text-sm font-extrabold text-zinc-800 uppercase tracking-wider">Enlace de tu tienda</h3>
                    <p className="text-[11px] font-semibold text-zinc-400 mt-1">Comparte este enlace con tus clientes.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 justify-between">
                      <span className="text-xs font-bold text-zinc-650 truncate max-w-[80%]">
                        https://{domains.subdomain}.flashcheckout.co
                      </span>
                      <a href={`https://${domains.subdomain}.flashcheckout.co`} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-zinc-700">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <button 
                      onClick={copyStoreUrl}
                      className="w-full py-2 bg-zinc-50 hover:bg-zinc-100/60 border border-zinc-200 hover:border-zinc-300 text-zinc-800 text-xs font-extrabold rounded-lg flex items-center justify-center gap-1.5 transition-all select-none active:scale-[0.98] cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-650" />
                          Enlace copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-zinc-400" />
                          Copiar enlace
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Estado de la tienda */}
                <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xs xl:text-sm font-extrabold text-zinc-800 uppercase tracking-wider">Estado de la tienda</h3>
                      <p className="text-[11px] font-semibold text-zinc-400 mt-1">Habilita o pausa tu vitrina digital.</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      storeActive ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-red-50 border border-red-100 text-red-700'
                    }`}>
                      {storeActive ? 'Activa' : 'Pausada'}
                    </span>
                  </div>

                  <button 
                    onClick={() => setStoreActive(!storeActive)}
                    className={`w-full py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 select-none ${
                      storeActive 
                        ? 'border border-red-150 hover:bg-red-50/50 text-red-650'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                    {storeActive ? 'Desactivar tienda' : 'Activar tienda'}
                  </button>
                </div>

              </div>
            </div>

            {/* Global floating action buttons at top right equivalent */}
            <div className="flex justify-end gap-3 pt-4">
              <button 
                onClick={() => alert('¡Guardado exitosamente! 🚀')}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs xl:text-sm rounded-lg shadow-sm hover:shadow active:scale-98 transition-all cursor-pointer select-none"
              >
                Guardar cambios
              </button>
            </div>

          </div>
        </div>
      )}

      {/* TABS OTHER THAN APARIENCIA */}
      {activeTab !== 'apariencia' && (
        <div className="max-w-2xl bg-white border border-zinc-200 rounded-xl p-6 xl:p-8 space-y-6 text-left animate-in fade-in duration-300">
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-zinc-955">Información General</h3>
                <p className="text-xs text-zinc-400 mt-1">Configura los datos primarios de tu negocio que se presentarán en la tienda.</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Nombre de la tienda</label>
                  <input type="text" value={storeInfo.name} onChange={e => setStoreInfo(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-xs xl:text-sm font-semibold focus:outline-none focus:border-zinc-950" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Descripción comercial</label>
                  <textarea rows={3} value={storeInfo.desc} onChange={e => setStoreInfo(prev => ({ ...prev, desc: e.target.value }))} className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-xs xl:text-sm font-semibold focus:outline-none focus:border-zinc-955 resize-none leading-relaxed" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">WhatsApp oficial</label>
                    <input type="tel" value={storeInfo.whatsapp} onChange={e => setStoreInfo(prev => ({ ...prev, whatsapp: e.target.value.replace(/\D/g, '') }))} className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-xs xl:text-sm font-semibold focus:outline-none focus:border-zinc-950" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">Dirección de despacho</label>
                    <input type="text" value={storeInfo.address} onChange={e => setStoreInfo(prev => ({ ...prev, address: e.target.value }))} className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-xs xl:text-sm font-semibold focus:outline-none focus:border-zinc-955" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dominios' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-zinc-955">Dirección y Dominios</h3>
                <p className="text-xs text-zinc-400 mt-1">Administra la dirección web pública de tu catálogo en internet.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Subdominio oficial FlashCheckout</label>
                  <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-lg overflow-hidden focus-within:border-zinc-955">
                    <input type="text" value={domains.subdomain} onChange={e => setDomains(prev => ({ ...prev, subdomain: e.target.value }))} className="flex-1 px-3 py-2.5 text-xs xl:text-sm font-bold bg-transparent border-none focus:outline-none min-w-0" />
                    <span className="pr-3 text-xs font-semibold text-zinc-400 select-none">.flashcheckout.co</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-zinc-100">
                  <label className="text-xs font-bold text-zinc-700">Conectar dominio personalizado (Pro)</label>
                  <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden bg-zinc-100 opacity-60">
                    <input type="text" disabled placeholder="Ej: misitio.com" className="flex-1 px-3 py-2.5 text-xs xl:text-sm font-semibold bg-transparent border-none focus:outline-none min-w-0" />
                    <span className="px-3 py-1 bg-zinc-200 text-[10px] font-black uppercase text-zinc-600 tracking-wider">Premium</span>
                  </div>
                  <p className="text-[10px] font-bold text-zinc-400">Personaliza por completo la identidad de tu marca vinculando un dominio propio ( require plan Pro o Enterprise ).</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-zinc-955">SEO (Optimización en Buscadores)</h3>
                <p className="text-xs text-zinc-400 mt-1">Mejora el posicionamiento de tu tienda en Google, Bing y compartidos de redes.</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Título meta (Meta Title)</label>
                  <input type="text" value={seo.title} onChange={e => setSeo(prev => ({ ...prev, title: e.target.value }))} className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-xs xl:text-sm font-semibold focus:outline-none focus:border-zinc-950" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Descripción meta (Meta Description)</label>
                  <textarea rows={3} value={seo.desc} onChange={e => setSeo(prev => ({ ...prev, desc: e.target.value }))} className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-xs xl:text-sm font-semibold focus:outline-none focus:border-zinc-955 resize-none leading-relaxed" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'redes' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-zinc-955">Redes Sociales</h3>
                <p className="text-xs text-zinc-400 mt-1">Vincula tus cuentas para que los clientes puedan explorar tu comunidad.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Instagram</label>
                  <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-lg p-1 px-3">
                    <span className="text-xs text-zinc-400 select-none">@</span>
                    <input type="text" placeholder="cafedelvalle" className="flex-1 p-2 bg-transparent border-none text-xs xl:text-sm font-semibold focus:outline-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Facebook Page</label>
                  <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-lg p-1 px-3">
                    <span className="text-xs text-zinc-400 select-none">fb.com/</span>
                    <input type="text" placeholder="cafedelvalle" className="flex-1 p-2 bg-transparent border-none text-xs xl:text-sm font-semibold focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'politicas' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-zinc-955">Políticas de la tienda</h3>
                <p className="text-xs text-zinc-400 mt-1">Redacta los términos para resolver disputas, reembolsos y envíos.</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Políticas de devoluciones y reembolsos</label>
                  <textarea rows={3} placeholder="Detalla los términos bajo los cuales realizarás devoluciones de dinero..." className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-xs xl:text-sm font-semibold focus:outline-none focus:border-zinc-950 resize-none leading-relaxed" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Políticas de envíos y despachos</label>
                  <textarea rows={3} placeholder="Especifica tiempos estimados de entrega, costos de despacho y coberturas..." className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-xs xl:text-sm font-semibold focus:outline-none focus:border-zinc-955 resize-none leading-relaxed" />
                </div>
              </div>
            </div>
          )}

          {/* Floating actions for non-appearance tabs */}
          <div className="flex justify-end gap-3 border-t border-zinc-100 pt-4">
            <button 
              onClick={() => alert('¡Guardado exitosamente! 🚀')}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs xl:text-sm rounded-lg shadow-sm hover:shadow active:scale-98 transition-all cursor-pointer select-none"
            >
              Guardar cambios
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
