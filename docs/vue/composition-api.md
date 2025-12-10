# Composition API

## setup
```vue
<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const double = computed(() => count.value * 2)
</script>
```

## ref
```javascript
const count = ref(0)
count.value++
```

## reactive
```javascript
const state = reactive({
  count: 0
})
```

## computed
```javascript
const double = computed(() => count.value * 2)
```

## watch
```javascript
watch(count, (newValue, oldValue) => {
  console.log(newValue, oldValue)
})
```
