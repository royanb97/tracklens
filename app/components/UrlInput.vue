<script setup lang="ts">
const props = defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  scan: [url: string]
}>()

const url = ref('')
const error = ref('')

function validate(value: string): boolean {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  }
  catch {
    return false
  }
}

function submit() {
  error.value = ''
  const trimmed = url.value.trim()

  if (!trimmed) {
    error.value = 'Please enter a URL.'
    return
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

  if (!validate(withProtocol)) {
    error.value = 'Please enter a valid URL (e.g. example.com).'
    return
  }

  emit('scan', withProtocol)
}
</script>

<template>
  <form class="flex flex-col gap-3 w-full" @submit.prevent="submit">
    <div class="flex gap-2">
      <UInput
        v-model="url"
        class="flex-1"
        size="lg"
        placeholder="https://example.com"
        :disabled="loading"
        aria-label="Website URL"
      />
      <UButton
        type="submit"
        size="lg"
        :loading="loading"
        :disabled="loading"
      >
        Scan
      </UButton>
    </div>
    <p v-if="error" class="text-sm text-red-500">
      {{ error }}
    </p>
  </form>
</template>
