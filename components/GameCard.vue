<template>
  <div
    class="game-card-wrapper group cursor-pointer"
    :class="{ 'opacity-50 cursor-not-allowed': !mode.enabled }"
    @click="handleClick"
  >
    <div class="game-card relative overflow-hidden p-6 h-full">
      <!-- Animated Background Gradient -->
      <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
           :class="gradientClass"></div>

      <!-- Glow Effect on Hover -->
      <div class="absolute inset-0 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"
           :class="glowClass"></div>

      <!-- Content -->
      <div class="relative z-10">
        <!-- Icon with Animation -->
        <div class="mb-4 relative">
          <div
            class="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300"
            :class="mode.enabled ? iconBgClass : 'bg-gray-700'"
          >
            <Icon :name="mode.icon" class="w-12 h-12 text-white group-hover:scale-110 transition-transform duration-300" />
          </div>
          <!-- Decorative Circle -->
          <div class="absolute -top-2 -right-2 w-8 h-8 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500"
               :class="mode.enabled ? accentClass : 'bg-gray-600'"></div>
        </div>

        <!-- Title with Gradient on Hover -->
        <h3 class="text-xl font-bold mb-2 capitalize transition-colors duration-300"
            :class="mode.enabled ? 'text-gray-100 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ' + textGradientClass : 'text-gray-400'">
          {{ mode.name }}
        </h3>

        <!-- Description -->
        <p class="text-sm text-gray-400 mb-6 leading-relaxed">{{ mode.description }}</p>

        <!-- Action Button -->
        <div v-if="!mode.enabled" class="inline-flex items-center px-4 py-2 rounded-lg bg-gray-700/50 text-xs text-gray-400 font-medium">
          <Icon name="mdi:clock-outline" class="w-4 h-4 mr-2" />
          Coming Soon
        </div>
        <div v-else class="inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 group-hover:px-6"
             :class="buttonClass">
          <span>Play Now</span>
          <Icon name="mdi:arrow-right" class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </div>

      <!-- Corner Accent -->
      <div class="absolute top-0 right-0 w-24 h-24 opacity-10 group-hover:opacity-20 transition-opacity duration-300"
           :class="cornerAccentClass"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GameModeConfig } from '~/types'

/**
 * Game mode card component
 * Displays game mode with icon, name, and description
 */
interface Props {
  mode: GameModeConfig
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  if (props.mode.enabled) {
    emit('click')
  }
}

// Color schemes for different game modes
const colorSchemes: Record<string, {
  gradient: string
  glow: string
  iconBg: string
  accent: string
  textGradient: string
  button: string
  cornerAccent: string
}> = {
  GUESS_FLAG: {
    gradient: 'bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-blue-600/10',
    glow: 'bg-blue-500',
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    accent: 'bg-cyan-400',
    textGradient: 'from-blue-400 to-cyan-400',
    button: 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30',
    cornerAccent: 'bg-gradient-to-br from-blue-500/30 to-transparent rounded-bl-full',
  },
  FLAGS: {
    gradient: 'bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-blue-600/10',
    glow: 'bg-blue-500',
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    accent: 'bg-cyan-400',
    textGradient: 'from-blue-400 to-cyan-400',
    button: 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30',
    cornerAccent: 'bg-gradient-to-br from-blue-500/30 to-transparent rounded-bl-full',
  },
  TIME_TRIAL: {
    gradient: 'bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-600/10',
    glow: 'bg-orange-500',
    iconBg: 'bg-gradient-to-br from-orange-500 to-red-600',
    accent: 'bg-red-400',
    textGradient: 'from-orange-400 to-red-400',
    button: 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 border border-orange-500/30',
    cornerAccent: 'bg-gradient-to-br from-orange-500/30 to-transparent rounded-bl-full',
  },
  FIND_CAPITAL: {
    gradient: 'bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-teal-600/10',
    glow: 'bg-emerald-500',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    accent: 'bg-teal-400',
    textGradient: 'from-emerald-400 to-teal-400',
    button: 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30',
    cornerAccent: 'bg-gradient-to-br from-emerald-500/30 to-transparent rounded-bl-full',
  },
  CAPITALS: {
    gradient: 'bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-teal-600/10',
    glow: 'bg-emerald-500',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    accent: 'bg-teal-400',
    textGradient: 'from-emerald-400 to-teal-400',
    button: 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30',
    cornerAccent: 'bg-gradient-to-br from-emerald-500/30 to-transparent rounded-bl-full',
  },
  HIGHER_LOWER: {
    gradient: 'bg-gradient-to-br from-purple-500/10 via-violet-500/10 to-indigo-600/10',
    glow: 'bg-purple-500',
    iconBg: 'bg-gradient-to-br from-purple-500 to-indigo-600',
    accent: 'bg-violet-400',
    textGradient: 'from-purple-400 to-indigo-400',
    button: 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30',
    cornerAccent: 'bg-gradient-to-br from-purple-500/30 to-transparent rounded-bl-full',
  },
  MAPS: {
    gradient: 'bg-gradient-to-br from-amber-500/10 via-yellow-500/10 to-orange-600/10',
    glow: 'bg-amber-500',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    accent: 'bg-yellow-400',
    textGradient: 'from-amber-400 to-orange-400',
    button: 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30',
    cornerAccent: 'bg-gradient-to-br from-amber-500/30 to-transparent rounded-bl-full',
  },
  MIXED: {
    gradient: 'bg-gradient-to-br from-pink-500/10 via-rose-500/10 to-fuchsia-600/10',
    glow: 'bg-pink-500',
    iconBg: 'bg-gradient-to-br from-pink-500 to-fuchsia-600',
    accent: 'bg-rose-400',
    textGradient: 'from-pink-400 to-fuchsia-400',
    button: 'bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 border border-pink-500/30',
    cornerAccent: 'bg-gradient-to-br from-pink-500/30 to-transparent rounded-bl-full',
  },
}

// Default color scheme
const defaultScheme = {
  gradient: 'bg-gradient-to-br from-gray-500/10 via-slate-500/10 to-gray-600/10',
  glow: 'bg-gray-500',
  iconBg: 'bg-gradient-to-br from-gray-500 to-slate-600',
  accent: 'bg-gray-400',
  textGradient: 'from-gray-400 to-slate-400',
  button: 'bg-gray-500/20 text-gray-300 hover:bg-gray-500/30 border border-gray-500/30',
  cornerAccent: 'bg-gradient-to-br from-gray-500/30 to-transparent rounded-bl-full',
}

const scheme = computed(() => colorSchemes[props.mode.id] || defaultScheme)

const gradientClass = computed(() => scheme.value.gradient)
const glowClass = computed(() => scheme.value.glow)
const iconBgClass = computed(() => scheme.value.iconBg)
const accentClass = computed(() => scheme.value.accent)
const textGradientClass = computed(() => scheme.value.textGradient)
const buttonClass = computed(() => scheme.value.button)
const cornerAccentClass = computed(() => scheme.value.cornerAccent)
</script>

<style scoped>
.game-card-wrapper {
  height: 100%;
  transition: transform 0.3s ease-in-out;
}

.game-card-wrapper:hover {
  transform: translateY(-8px);
}

.game-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease-in-out;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.game-card-wrapper:hover .game-card {
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}
</style>
