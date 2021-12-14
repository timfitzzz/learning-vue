
# Vue and TypeScript

There's a helpful [page entitled TypeScript Support on v3.vuejs.org](https://v3.vuejs.org/guide/typescript-support.html#project-creation) that we'll use as our main guide here, since the tutorial doesn't involve TypeScript at all, and following tutorials in a straightforward fashion, without fouling them up / customizing them with our own favorite configuration options, is simply no fun.

### Generalities

- Vue 3 is written in TypeScript, of course, so that's a good sign.
- If you've using VSCode inside a monorepo, like this one, with Vetur to provide linting, etc, you may need to [add a vetur.config.js file in the root of your actual project](https://vuejs.github.io/vetur/guide/setup.html#advanced) to avoid some weird type errors.
- Or better yet, you should switch to Volar, which I had a lot fewer problems with, instead of Vetur.

## tsconfig.json

The Vue docs recommend:

```
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    // this enables stricter inference for data properties on `this`
    "strict": true,
    "jsx": "preserve",
    "moduleResolution": "node"
  }
}
```

* ```target: "esnext"```
* ```module: "esnext"```
  These are interesting choices, since "esnext" is shorthand for "whatever the newest ECMAScript version supported by your TypeScript version is" -- making this setting a moving target, generally used with caution. Recommending this as a default suggests that Vue requires newer language features, and that it will be further Babeling and Webpacking the code to make it browser-ready.

* ```strict: true```
  I like strict mode -- it forces me to learn more about TypeScript, and express it more fluently, in order to keep tsc happy. That said, that process can add time one doesn't always have, and sometimes you have to throw a @tsignore comment into your code and keep moving.

  But never mind all that, because Vue took the time to explain this in their documentation, as quoted above -- TS strict mode enables stricter inference for 'this', which will be interesting to see in action as we explore Vue further. Further notes in the docs suggest that without this feature, quite a lot of what's written within the Vue component object literal would wind up being typed as ```any``` -- clearly very problematic.

* ```jsx: preserve```
  I wasn't sure that what we've seen from Vue so far actually constitutes JSX, since properties lack {}, and native HTML properties seem the basis for a lot of the syntax we've learned so far. But apparently JSX does have a role in Vue -- or perhaps this is evidence of the 'progressive' part of 'progressive web framework' (which seems to be Vue for 'adopt Vue incrementally'), and Vue is just leaving our options open for us. Time will tell -- the "preserve" option keeps JSX unparsed within our files, presumably leaving it for Babel to deal with.

* ```moduleResolution: node```
  This is a standard option indicating that ts should resolve modules using the CommonJS implementation from node -- the one most NPM-aware JS developers take for granted.




## Configuring Webpack for TypeScript

The Vue CLI has taken care of creating separate configuration files for us, which includes a babel.config.js file -- but it didn't create a webpack.config.js file, which tells me that Vue's CLI assumes a default Webpack configuration, and we only need to specify our own if we want to deviate from that default at some point while developing our app.

So, if we did need to specify a webpack config, we'd need to include the following options to preserve TypeScript support:

```js
// webpack.config.js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/],
        },
        exclude: /node_modules/,
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      }
    // ...
    ]
  }
}
```

## TypeScript in Vue Components

As previously mentioned, we can enable TypeScript (or TypeScript with JSX) in Vue components using a ```lang``` property on the ```<script/>``` element:

```vue
<script lang="ts"> // or "tsx"
  ...
</script>
```

Additionally, within the ```<script/>``` tag, we need to use vue's ```defineComponent``` function in order to enable type inference.

```ts
import { defineComponent } from 'vue'

const Component = defineComponent({
  // type inference enabled
})
```

Or in the case of single-file components:

```html
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // type inference enabled
})
</script>
```

### Options API

The tutorial indicated we'd be using the "options API", so this is us. According to the docs, TypeScript can infer most types for the methods we define on our components. Great! 

If we have a more complex type or interface (guess we'll find out just how common this winds up being), we can describe types in our methods by using the ```as <Type>``` syntax for explicit casting.

#### Global Properties

We haven't talked about this yet, but apparently Vue 3 "provides a ```globalProperties``` object that can be used to add a global property accessible to any component instance." They offer axios as a pretty simple example (and another that uses the same approach within a Vue plugin):

```ts
// User Definition
import axios from 'axios'

const app = Vue.createApp({})
app.config.globalProperties.$http = axios
```

To make this process type-safe, we'll use TypeScript's module augmentation syntax. For the above example, we would add:

```ts
import axios from 'axios'

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $http: typeof axios
    $validate: (data: object, rule: object) => boolean
  }
}
```

That's kind of a lot! Fortunately, it seems like this is something you would only need to do for plugins or other enhancements to Vue. You can place the declaration in a project-wide ```*.d.ts``` file as well, like ```src/typings``` or another folder specified in ```tsconfig.json```. The Vue docs do make a point to note that there needs to be a top-level import or export in your type definitions file, or else the type declaration will replace rather than augment Vue's real types. They refer us to some documentation for more on the [ComponentCustomProperties](https://github.com/vuejs/vue-next/blob/2587f36fe311359e2e34f40e8e47d2eebfab7f42/packages/runtime-core/src/componentOptions.ts#L64-L80) type and, interestingly, [the TypeScript unit tests](https://github.com/vuejs/vue-next/blob/master/test-dts/componentTypeExtensions.test-d.tsx) in the Vue repo itself.

#### Annotating Return Types

Sometimes you might have to annotate the return types of computed properties (which we haven't learned about just yet):

```tsx
import { defineComponent } from 'vue'

const Component = defineComponent({
  data() {
    return {
      message: 'Hello!'
    }
  },
  computed: {
    // needs an annotation
    greeting(): string {
      return this.message + '!'
    },

    // in a computed with a setter, getter needs to be annotated
    greetingUppercased: {
      get(): string {
        return this.greeting.toUpperCase()
      },
      set(newValue: string) {
        this.message = newValue.toUpperCase()
      }
    }
  }
})
```

#### Annotating Props

Of course, we need to annotate component props, just as in React. We can do this using the "type" property in our property definitions for any complex types:

```tsx
import { defineComponent, PropType } from 'vue'

interface Book {
  title: string
  author: string
  year: number
}

const Component = defineComponent({
  props: {
    name: String,
    id: [Number, String],
    success: { type: String },
    callback: {
      type: Function as PropType<() => void>
    },
    book: {
      type: Object as PropType<Book>,
      required: true
    },
    metadata: {
      type: null // metadata is typed as any
    }
  }
})
```

The docs do highlight a warning due to a TypeScript design limitation "when it comes to type inference of function expressions": be careful with ```validator``` and ```default``` values for objects and arrays:

```tsx
const Component = defineComponent({
  props: {
    bookA: {
      type: Object as PropType<Book>,
      // Make sure to use arrow functions
      default: () => ({
        title: 'Arrow Function Expression'
      }),
      validator: (book: Book) => !!book.title
    },
    bookB: {
      type: Object as PropType<Book>,
      // Or provide an explicit this parameter
      default(this: void) {
        return {
          title: 'Function Expression'
        }
      },
      validator(this: void, book: Book) {
        return !!book.title
      }
    }
  }
})
```

So we'll need to use arrow functions, or provide an explicit this. Most of the time I suspect I will just reflexively use arrow functions, so I'll need to be careful not to forget this underlying requirement in case a situation arises where I don't want to use an arrow function.

#### Annotating Emits

There's an "emits" portion of the Vue component object literal -- it looks like it's where you put a validator function for emitted events. We can type the event payloads here:

```ts
const Component = defineComponent({
  emits: {
    addBook(payload: { bookName: string }) {
      // perform runtime validation
      return payload.bookName.length > 0
    }
  },
  methods: {
    onSubmit() {
      this.$emit('addBook', {
        bookName: 123 // Type error!
      })

      this.$emit('non-declared-event') // Type error!
    }
  }
})
```

### The Composition API

There's another way to use Vue, but it's not going to be covered in the tutorial we're currently following. I'm not quite sure what the distinction is so far -- let's circle back and flesh this part out later.