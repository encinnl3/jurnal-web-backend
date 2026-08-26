'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface ProfileCardProps {
  id: string
  name: string
  avatar_url: string | null
  index: number
}

export default function ProfileCard({ id, name, avatar_url, index }: ProfileCardProps) {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push(`/visitor/${id}`)}
      className="glass-card p-8 cursor-pointer group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-600 to-amber-900 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-amber-900/20 overflow-hidden group-hover:shadow-amber-600/30 transition-shadow duration-500">
          {avatar_url ? (
            <img src={avatar_url} alt={name} className="w-full h-full object-cover" />
          ) : (
            name.charAt(0)
          )}
        </div>

        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-1">{name}</h2>
          <p className="text-sm text-stone-500 uppercase tracking-widest">Peserta PKL</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full py-3 rounded-full bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors"
        >
          Buka Jurnal →
        </motion.button>
      </div>
    </motion.div>
  )
}
