const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'components', 'ProductManager.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Category label
content = content.replace(
  `<p className="text-[12px] font-bold tracking-[0.05em] text-emerald-600 mb-1">Editor de inventario</p>`,
  `<p className="text-[11px] font-bold tracking-[0.08em] text-zinc-400 uppercase mb-1">Editor de inventario</p>`
);

// 2. Name input group focus & input border
content = content.replace(
  `<Type className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary transition-colors" />
                      <input
                        type="text"
                        className="w-full bg-zinc-50 border border-gray-200 rounded-lg pl-14 pr-8 py-3.5 text-base font-normal text-zinc-950 placeholder:text-zinc-300 focus:outline-none focus:border-emerald-500/30 transition-all"`,
  `<Type className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-zinc-500 transition-colors" />
                      <input
                        type="text"
                        className="w-full bg-zinc-50 border border-gray-200 rounded-lg pl-14 pr-8 py-3.5 text-base font-normal text-zinc-955 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 focus:bg-white transition-all"`
);

// 3. Description focus border
content = content.replace(
  `                      <textarea
                        className="w-full bg-zinc-50 border border-gray-200 rounded-lg px-5 py-3 text-base font-normal text-zinc-955 placeholder:text-zinc-300 focus:outline-none focus:border-emerald-500/30 transition-all min-h-[120px] resize-y"`,
  `                      <textarea
                        className="w-full bg-zinc-50 border border-gray-200 rounded-lg px-5 py-3 text-base font-normal text-zinc-955 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 focus:bg-white transition-all min-h-[120px] resize-y"`
);

// 4. Category focus border
content = content.replace(
  `                      <Package className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary transition-colors" />
                      <select
                        className="w-full bg-zinc-50 border border-gray-200 rounded-lg pl-14 pr-8 py-3.5 text-base font-semibold text-black appearance-none focus:outline-none focus:border-primary/30 transition-all"`,
  `                      <Package className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-zinc-500 transition-colors" />
                      <select
                        className="w-full bg-zinc-50 border border-gray-200 rounded-lg pl-14 pr-8 py-3.5 text-base font-semibold text-black appearance-none focus:outline-none focus:border-zinc-400 focus:bg-white transition-all"`
);

// 5. Price focus border
content = content.replace(
  `                        <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary transition-colors" />
                        <input
                          type="number"
                          className="w-full bg-zinc-50 border border-gray-200 rounded-lg pl-14 pr-8 py-3.5 text-base font-normal text-zinc-950 placeholder:text-zinc-300 focus:outline-none focus:border-emerald-500/30 transition-all tabular-nums"`,
  `                        <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-zinc-500 transition-colors" />
                        <input
                          type="number"
                          className="w-full bg-zinc-50 border border-gray-200 rounded-lg pl-14 pr-8 py-3.5 text-base font-normal text-zinc-955 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 focus:bg-white transition-all tabular-nums"`
);

// 6. Stock focus border
content = content.replace(
  `                        <Hash className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-primary transition-colors" />
                        <input
                          type="number"
                          className="w-full bg-zinc-50 border border-gray-200 rounded-lg pl-14 pr-8 py-3.5 text-base font-normal text-zinc-955 placeholder:text-zinc-300 focus:outline-none focus:border-emerald-500/30 transition-all tabular-nums"`,
  `                        <Hash className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-zinc-500 transition-colors" />
                        <input
                          type="number"
                          className="w-full bg-zinc-50 border border-gray-200 rounded-lg pl-14 pr-8 py-3.5 text-base font-normal text-zinc-955 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 focus:bg-white transition-all tabular-nums"`
);

// 7. Image principal ring
content = content.replace(
  `"relative aspect-square rounded-xl overflow-hidden border border-zinc-200 group bg-zinc-50 shadow-sm transition-all duration-300",
                          idx === 0 && "ring-2 ring-emerald-500 ring-offset-2"`,
  `"relative aspect-square rounded-xl overflow-hidden border border-zinc-200 group bg-zinc-50 shadow-sm transition-all duration-300",
                          idx === 0 && "ring-2 ring-zinc-955 ring-offset-2"`
);

// 8. Image principal badge
content = content.replace(
  `{/* Principal Badge */}
                        {idx === 0 && (
                          <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm tracking-wider z-20">`,
  `{/* Principal Badge */}
                        {idx === 0 && (
                          <div className="absolute top-2 left-2 bg-zinc-950 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm tracking-wider z-20">`
);

// 9. bg-zinc-955 typo in original code
content = content.replace(
  `bg-zinc-955/60`,
  `bg-zinc-950/60`
);

// 10. Upload Trigger hover
content = content.replace(
  `{/* Upload Trigger card if images < 5 */}
                    {productImages.length < 5 && (
                      <label className="border-2 border-dashed border-zinc-200 hover:border-emerald-500/50 hover:bg-zinc-50/50 aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group relative">
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/jpeg, image/png, image/webp" 
                          multiple
                          onChange={handleImageSelect} 
                        />
                        <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all shadow-sm">
                          <Plus className="w-5 h-5 text-zinc-400 group-hover:text-emerald-600" />
                        </div>
                        <span className="text-[10px] font-bold tracking-widest text-zinc-400 group-hover:text-zinc-650 transition-colors text-center px-2">
                          Añadir imagen
                        </span>
                      </label>
                    )}`,
  `{/* Upload Trigger card if images < 5 */}
                    {productImages.length < 5 && (
                      <label className="border-2 border-dashed border-zinc-200 hover:border-zinc-950 hover:bg-zinc-50/50 aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group relative">
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/jpeg, image/png, image/webp" 
                          multiple
                          onChange={handleImageSelect} 
                        />
                        <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-zinc-100 group-hover:text-zinc-805 transition-all shadow-sm">
                          <Plus className="w-5 h-5 text-zinc-400 group-hover:text-zinc-805" />
                        </div>
                        <span className="text-[10px] font-bold tracking-widest text-zinc-400 group-hover:text-zinc-650 transition-colors text-center px-2">
                          Añadir imagen
                        </span>
                      </label>
                    )}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated ProductManager.tsx!');
