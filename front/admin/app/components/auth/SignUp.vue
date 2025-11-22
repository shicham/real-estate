<script setup lang="ts">
import { useRouter } from '#app'
import { Loader2 } from 'lucide-vue-next'
import { ref } from 'vue'
import { cn } from '@/lib/utils'

const authStore = useAuthStore()
const router = useRouter()

// Form state
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const successMessage = ref('')

// Field validation errors
const nameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

// Password strength indicator
const passwordStrength = computed(() => {
  if (!password.value)
    return 0
  let strength = 0
  if (password.value.length >= 8)
    strength++
  if (/[a-z]/.test(password.value))
    strength++
  if (/[A-Z]/.test(password.value))
    strength++
  if (/\d/.test(password.value))
    strength++
  if (/[@$!%*?&]/.test(password.value))
    strength++
  return strength
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength === 0)
    return ''
  if (strength <= 2)
    return 'Faible'
  if (strength === 3)
    return 'Moyen'
  if (strength === 4)
    return 'Bon'
  return 'Fort'
})

const passwordStrengthColor = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 2)
    return 'bg-red-500'
  if (strength === 3)
    return 'bg-yellow-500'
  if (strength === 4)
    return 'bg-blue-500'
  return 'bg-green-500'
})

function validateName() {
  if (!name.value) {
    nameError.value = 'Le nom est requis.'
    return false
  }
  if (name.value.length < 2) {
    nameError.value = 'Le nom doit contenir au moins 2 caractères.'
    return false
  }
  nameError.value = ''
  return true
}

function validateEmail() {
  const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
  if (!email.value) {
    emailError.value = 'L\'email est requis.'
    return false
  }
  if (!emailRegex.test(email.value)) {
    emailError.value = 'Email invalide.'
    return false
  }
  emailError.value = ''
  return true
}

function validatePassword() {
  if (!password.value) {
    passwordError.value = 'Le mot de passe est requis.'
    return false
  }
  if (password.value.length < 8) {
    passwordError.value = 'Le mot de passe doit contenir au moins 8 caractères.'
    return false
  }
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/
  if (!passwordRegex.test(password.value)) {
    passwordError.value = 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.'
    return false
  }
  passwordError.value = ''
  return true
}

function validateConfirmPassword() {
  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Veuillez confirmer votre mot de passe.'
    return false
  }
  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Les mots de passe ne correspondent pas.'
    return false
  }
  confirmPasswordError.value = ''
  return true
}

async function onSubmit(event: Event) {
  event.preventDefault()
  errorMessage.value = ''
  successMessage.value = ''

  // Reset all errors
  nameError.value = ''
  emailError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''

  // Validate all fields
  const isNameValid = validateName()
  const isEmailValid = validateEmail()
  const isPasswordValid = validatePassword()
  const isConfirmPasswordValid = validateConfirmPassword()

  if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
    return
  }

  const result = await authStore.register(
    name.value,
    email.value,
    password.value,
    confirmPassword.value,
  )

  if (result.success) {
    successMessage.value = result.message || 'Inscription réussie! Redirection...'
    // Redirect after a short delay
    setTimeout(() => {
      router.push('/')
    }, 1500)
  }
  else {
    errorMessage.value = result.error || 'Erreur lors de l\'inscription.'
  }
}
</script>

<template>
  <div :class="cn('grid gap-6', $attrs.class ?? '')">
    <form @submit="onSubmit">
      <div class="grid gap-4">
        <div class="grid gap-2">
          <Label for="name">
            Nom complet
          </Label>
          <Input
            id="name"
            v-model="name"
            placeholder="Entrez votre nom"
            type="text"
            auto-capitalize="words"
            auto-complete="name"
            auto-correct="off"
            :disabled="authStore.isLoading"
            @blur="validateName"
          />
          <p v-if="nameError" class="text-sm text-red-500">
            {{ nameError }}
          </p>
        </div>
        <div class="grid gap-2">
          <Label for="email">
            Email
          </Label>
          <Input
            id="email"
            v-model="email"
            placeholder="name@example.com"
            type="email"
            auto-capitalize="none"
            auto-complete="email"
            auto-correct="off"
            :disabled="authStore.isLoading"
            @blur="validateEmail"
          />
          <p v-if="emailError" class="text-sm text-red-500">
            {{ emailError }}
          </p>
        </div>
        <div class="grid gap-2">
          <Label for="password">
            Mot de passe
          </Label>
          <PasswordInput
            id="password"
            v-model="password"
            :disabled="authStore.isLoading"
            @blur="validatePassword"
          />
          <p v-if="passwordError" class="text-sm text-red-500">
            {{ passwordError }}
          </p>
          <!-- Password strength indicator -->
          <div v-if="password" class="space-y-1">
            <div class="flex gap-1">
              <div
                v-for="i in 5"
                :key="i"
                class="h-1 flex-1 rounded-full bg-gray-200"
                :class="i <= passwordStrength ? passwordStrengthColor : ''"
              />
            </div>
            <p class="text-xs text-muted-foreground">
              Force du mot de passe: {{ passwordStrengthText }}
            </p>
          </div>
        </div>
        <div class="grid gap-2">
          <Label for="confirm-password">
            Confirmer le mot de passe
          </Label>
          <PasswordInput
            id="confirm-password"
            v-model="confirmPassword"
            :disabled="authStore.isLoading"
            @blur="validateConfirmPassword"
          />
          <p v-if="confirmPasswordError" class="text-sm text-red-500">
            {{ confirmPasswordError }}
          </p>
        </div>

        <!-- Success message -->
        <p v-if="successMessage" class="text-sm text-green-600">
          {{ successMessage }}
        </p>

        <!-- Error message -->
        <p v-if="errorMessage" class="text-sm text-red-500">
          {{ errorMessage }}
        </p>

        <Button :disabled="authStore.isLoading" type="submit">
          <Loader2 v-if="authStore.isLoading" class="mr-2 h-4 w-4 animate-spin" />
          S'inscrire
        </Button>
      </div>
    </form>
    <Separator label="Ou continuer avec" />
    <div class="flex items-center gap-4">
      <Button variant="outline" class="w-full gap-2" type="button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="size-4">
          <path
            d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
            fill="currentColor"
          />
        </svg>
        Apple
      </Button>
      <Button variant="outline" class="w-full gap-2" type="button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="size-4">
          <path
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            fill="currentColor"
          />
        </svg>
        Google
      </Button>
    </div>
  </div>
</template>
